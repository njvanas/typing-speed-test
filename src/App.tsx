import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Keyboard, RotateCcw, Timer, Trophy } from 'lucide-react';
import { supabase } from './supabase';
import About from './pages/About';
import Projects from './pages/Projects';
import Experience from './pages/Experience';
import Contact from './pages/Contact';

const TYPING_TESTS = [
  "The quick brown fox jumps over the lazy dog, while the agile cat prowls nearby, watching intently.",
  "In a bustling café, people sip their lattes and tap away on laptops, creating a symphony of keystrokes.",
  "Programming requires attention to detail, precise syntax, and careful debugging to create efficient code.",
  "The mysterious package arrived at midnight, wrapped in brown paper and tied with twine.",
  "Scientists discovered a remarkable new species deep in the rainforest, hidden from human eyes."
];

function getRandomText(currentText: string): string {
  let newText;
  do {
    newText = TYPING_TESTS[Math.floor(Math.random() * TYPING_TESTS.length)];
  } while (newText === currentText);
  return newText;
}

interface Stats {
  wpm: number;
  accuracy: number;
  time: number;
}

interface HighScore {
  username: string;
  wpm: number;
  accuracy: number;
  time: number;
}

function App() {
  const [text, setText] = useState('');
  const [targetText, setTargetText] = useState(TYPING_TESTS[0]);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [stats, setStats] = useState<Stats>({ wpm: 0, accuracy: 0, time: 0 });
  const timerRef = useRef<number>();
  const [hasError, setHasError] = useState(false);
  const [username, setUsername] = useState('');
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [showNameInput, setShowNameInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchHighScores();
  }, []);

  const fetchHighScores = async () => {
    const { data, error } = await supabase
      .from('high_scores')
      .select('username, wpm, accuracy, time')
      .order('wpm', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching high scores:', error);
      return;
    }

    setHighScores(data || []);
  };

  const submitScore = async () => {
    if (!username.trim()) {
      setErrorMessage('Please enter a username');
      return;
    }

    const { error } = await supabase
      .from('high_scores')
      .insert([
        {
          username: username.trim(),
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          time: stats.time
        }
      ]);

    if (error) {
      if (error.code === '23505') {
        setErrorMessage('Username already taken. Please choose another.');
      } else {
        setErrorMessage('Error submitting score. Please try again.');
      }
      return;
    }

    setShowNameInput(false);
    setErrorMessage('');
    fetchHighScores();
  };

  const calculateStats = useCallback(() => {
    const endTime = Date.now();
    const timeInMinutes = (endTime - startTime) / 60000;
    const words = text.trim().split(' ').length;
    const wpm = Math.round(words / timeInMinutes);
    
    let correctChars = 0;
    const minLength = Math.min(text.length, targetText.length);
    for (let i = 0; i < minLength; i++) {
      if (text[i] === targetText[i]) correctChars++;
    }
    const accuracy = Math.round((correctChars / targetText.length) * 100);
    
    setStats({
      wpm,
      accuracy,
      time: Math.round(timeInMinutes * 60)
    });
  }, [text, targetText, startTime]);

  useEffect(() => {
    if (isStarted && !isFinished) {
      timerRef.current = window.setInterval(() => {
        const currentTime = Date.now();
        const timeInMinutes = (currentTime - startTime) / 60000;
        const words = text.trim().split(' ').length;
        const wpm = Math.round(words / timeInMinutes);
        
        let correctChars = 0;
        const minLength = Math.min(text.length, targetText.length);
        for (let i = 0; i < minLength; i++) {
          if (text[i] === targetText[i]) correctChars++;
        }
        const accuracy = Math.round((correctChars / targetText.length) * 100);
        setStats({ wpm, accuracy, time: Math.round(timeInMinutes * 60) });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [isStarted, isFinished, text, targetText, startTime]);

  useEffect(() => {
    // Check if there are any errors in the typed text
    const hasErrors = text.split('').some((char, index) => char !== targetText[index]);
    setHasError(hasErrors);

    if (text === targetText && !hasErrors) {
      setIsFinished(true);
      calculateStats();
      setShowNameInput(true);
    }
  }, [text, targetText, calculateStats]);

  const handleStart = () => {
    if (!isStarted) {
      setStartTime(Date.now());
      setIsStarted(true);
    }
  };

  const handleReset = () => {
    setText('');
    setIsStarted(false);
    setIsFinished(false);
    setStartTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    setStats({ wpm: 0, accuracy: 0, time: 0 });
    setHasError(false);
    setTargetText(getRandomText(targetText));
    setShowNameInput(false);
    setErrorMessage('');
  };

  const getHighlightedText = () => {
    return targetText.split('').map((char, index) => {
      let className = 'font-mono text-gray-300 text-lg';
      if (index < text.length) {
        className += text[index] === char ? ' text-green-400' : ' text-red-400';
      }
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <Router basename="/njvanas.github.io">
      <Routes>
        <Route path="/" element={<div>Welcome to my site!</div>} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
