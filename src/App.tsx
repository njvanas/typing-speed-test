import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Keyboard, RotateCcw, Timer, Trophy } from 'lucide-react';
import { supabase } from './supabase';

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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Keyboard className="w-12 h-12 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold text-white">Typing Speed Test</h1>
          <p className="text-gray-400">Test your typing speed and accuracy</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-6 border border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Timer className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">{stats.time}s</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-300">{stats.wpm} WPM</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-300">{stats.accuracy}% Accuracy</span>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          <div className="relative">
            <div className="text-lg p-6 bg-gray-700/50 rounded-lg border border-gray-600 min-h-[120px]">
              <div className="max-w-3xl mx-auto leading-loose tracking-normal whitespace-pre-wrap">
              {getHighlightedText()}
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => {
                handleStart();
                setText(e.target.value);
              }}
              disabled={isFinished}
              className="absolute inset-0 w-full h-full opacity-0 cursor-text"
              autoFocus
            />
          </div>

          {hasError && text.length === targetText.length && !isFinished && (
            <div className="text-center bg-red-900/20 p-4 rounded-lg border border-red-700">
              <p className="text-red-400">
                There are errors in your typing. Please correct them to complete the test.
              </p>
            </div>
          )}

          {isFinished && (
            <div className="text-center bg-green-900/20 p-4 rounded-lg border border-green-700 space-y-4">
              <h2 className="text-xl font-semibold text-green-400">Test Complete!</h2>
              <p className="text-green-300">
                You typed at {stats.wpm} WPM with {stats.accuracy}% accuracy
              </p>
              {showNameInput && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                    maxLength={20}
                  />
                  {errorMessage && (
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  )}
                  <button
                    onClick={submitScore}
                    className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    Submit Score
                  </button>
                </div>
              )}
            </div>
          )}

          {!isStarted && (
            <div className="text-center text-gray-400">
              Start typing to begin the test
            </div>
          )}

          {/* High Scores Table */}
          <div className="mt-8">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-white">Top 50 Typists</h2>
            </div>
            <div className="bg-gray-700/50 rounded-lg border border-gray-600 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-gray-300">#</th>
                    <th className="px-4 py-2 text-gray-300">Username</th>
                    <th className="px-4 py-2 text-gray-300">WPM</th>
                    <th className="px-4 py-2 text-gray-300">Accuracy</th>
                    <th className="px-4 py-2 text-gray-300">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {highScores.map((score, index) => (
                    <tr key={score.username} className="border-t border-gray-600">
                      <td className="px-4 py-2 text-gray-400">{index + 1}</td>
                      <td className="px-4 py-2 text-gray-300">{score.username}</td>
                      <td className="px-4 py-2 text-gray-300">{score.wpm}</td>
                      <td className="px-4 py-2 text-gray-300">{score.accuracy}%</td>
                      <td className="px-4 py-2 text-gray-300">{score.time}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
