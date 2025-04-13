const text = document.getElementById("sample-text").innerText;
const input = document.getElementById("typing-input");
const timerDisplay = document.getElementById("timer");
const wpmDisplay = document.getElementById("wpm");
const startBtn = document.getElementById("start-btn");
const leaderboardList = document.getElementById("leaderboard-list");

let startTime, interval;

function startTest() {
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
  leaderboard = leaderboard.filter(entry => entry.name !== name); // No duplicates
  leaderboard.push({ name, wpm });
  leaderboard.sort((a, b) => b.wpm - a.wpm);
  leaderboard = leaderboard.slice(0, 50); // Max 50

  localStorage.setItem("typingLeaderboard", JSON.stringify(leaderboard));
  displayLeaderboard();
}

function displayLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem("typingLeaderboard")) || [];
  leaderboardList.innerHTML = leaderboard
    .map(entry => `<li><strong>${entry.name}</strong>: ${entry.wpm} WPM</li>`) 
    .join("");
}

input.addEventListener("input", () => {
  if (input.value === text) {
    endTest();
  }
});

startBtn.addEventListener("click", startTest);

displayLeaderboard();