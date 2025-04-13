const sentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Typing speed is a great way to test your accuracy.",
  "Practice makes perfect, especially in typing.",
  "Every developer should know how to type fast.",
  "Test your limits with this short typing challenge.",
  "Focus, type, and beat your best score.",
  "Keep your eyes on the screen and fingers on keys.",
  "Let the rhythm of typing flow like music.",
  "Speed matters, but accuracy wins the race.",
  "Typing tests are both fun and competitive."
];

let text = "";
const textDisplay = document.getElementById("sample-text");
const input = document.getElementById("typing-input");
const timerDisplay = document.getElementById("timer");
const wpmDisplay = document.getElementById("wpm");
const startBtn = document.getElementById("start-btn");
const leaderboardList = document.getElementById("leaderboard-list");

let startTime, interval;

function getRandomSentence() {
  return sentences[Math.floor(Math.random() * sentences.length)];
}

function startTest() {
  text = getRandomSentence();
  textDisplay.innerText = text;
  input.value = "";
  input.disabled = false;
  input.focus();
  startTime = Date.now();
  timerDisplay.textContent = 0;
  wpmDisplay.textContent = 0;
  interval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = seconds;
}

function endTest() {
  clearInterval(interval);
  input.disabled = true;
  const timeTaken = (Date.now() - startTime) / 60000;
  const wordCount = input.value.trim().split(/\s+/).length;
  const wpm = Math.round(wordCount / timeTaken);
  wpmDisplay.textContent = wpm;

  let name = prompt("Enter your name for the leaderboard:");
  if (!name || !name.trim()) return;
  name = name.trim();

  let leaderboard = JSON.parse(localStorage.getItem("typingLeaderboard")) || [];
  leaderboard = leaderboard.filter(entry => entry.name !== name);
  leaderboard.push({ name, wpm });
  leaderboard.sort((a, b) => b.wpm - a.wpm);
  leaderboard = leaderboard.slice(0, 50);

  localStorage.setItem("typingLeaderboard", JSON.stringify(leaderboard));
  displayLeaderboard();
}

function displayLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem("typingLeaderboard")) || [];
  leaderboardList.innerHTML = leaderboard
    .map(entry => `<li><strong>${entry.name}</strong>: ${entry.wpm} WPM</li>`) 
    .join("");
}

input.addEventListener("paste", e => e.preventDefault());

input.addEventListener("input", () => {
  if (input.value === text) {
    endTest();
  }
});

startBtn.addEventListener("click", startTest);
displayLeaderboard();
