// load highscores
const highscoresEl = document.getElementById("highscores");
let highscores = localStorage.getItem("highscores") || Array(5).fill(0);
if (typeof highscores == "string") highscores = highscores.split(";");
loadHighscores();

function loadHighscores() {
  // reset highscore element
  highscoresEl.innerHTML = "";

  // store highscores into localStorage
  localStorage.setItem("highscores", highscores.join(";"));

  for (const highscore of highscores) {
    const listItem = document.createElement("li");
    listItem.innerText = highscore;

    highscoresEl.appendChild(listItem);
  }
}

// get wordlist and syllables from server
const words = (await (await fetch("assets/wordlist.txt")).text()).split("\r\n");
const syllables = await (await fetch("assets/syllables.json")).json();

const wordsPerPromptInput = document.getElementById("wordsPerPromptInput");
const infiniteModeInput = document.getElementById("infiniteModeInput");
const promptTimeInput = document.getElementById("promptTimeInput");
const gameTimeInput = document.getElementById("gameTimeInput");

const startContainer = document.getElementById("startContainer");
const gameContainer = document.getElementById("gameContainer");

const startButton = document.getElementById("startButton");
const wordPrompt = document.getElementById("wordPrompt");
const inputWord = document.getElementById("inputWord");
const gameTimeEl = document.getElementById("gameTime");

const finalScoreEl = document.getElementById("finalScore");
const scoreEl = document.getElementById("score");

let promptTimeInterval;
let promptTime = 8;
let gameTime = 60;
let wordsPerPrompt = parseInt(wordsPerPromptInput.value) || 500;

function findSyllables(wordsPerPrompt) {
  let output = [];

  for (const count of Object.keys(syllables).reverse()) {
    if (parseInt(count) >= wordsPerPrompt) {
      output = output.concat(syllables[count]);
    } else {
      break;
    }
  }

  return output;
}

let currentSyllables = findSyllables(wordsPerPrompt);

let inputtedWords = [];
let inGame = false;
let score = 0;

function findHighscoreIndex(score) {
  const index = highscores.findIndex(highscore => highscore < score);
  return index < 0 ? highscores.length - 1 : index;
}

function updateScore(plus) {
  plus ? score++ : score--;
  scoreEl.innerText = `Score: ${score}`;
}

function nextPrompt() {
  const newSyllable =
    currentSyllables[Math.round(Math.random() * (currentSyllables.length - 1))];

  console.log("current syllable:", newSyllable);

  wordPrompt.innerText = newSyllable;
  inputWord.value = "";

  if (infiniteModeInput.checked) return;

  let currentPromptTime = promptTime;

  clearInterval(promptTimeInterval);
  promptTimeInterval = setInterval(() => {
    // 8 seconds
    if (currentPromptTime-- == 1) {
      nextPrompt();
      updateScore(false);
    }
  }, 1000);
}

function endGame() {
  clearInterval(promptTimeInterval);
  inGame = false;

  if (score > highscores[highscores.length - 1]) {
    highscores.splice(findHighscoreIndex(score), 0, score);
    highscores.pop();

    loadHighscores();
  }

  finalScoreEl.innerText = `Final Score: ${score}`;

  score = 0;
  gameTime = 60;
  inputtedWords = [];

  gameContainer.style.display = "none";
  startContainer.style.display = "block";
}

function startGame() {
  inGame = true;

  startContainer.style.display = "none";
  gameContainer.style.display = "block";

  nextPrompt();
  inputWord.focus();

  if (infiniteModeInput.checked) {
    gameTimeEl.innerText = "Infinite mode";
    return;
  }

  gameTimeEl.innerText = `${gameTime}s`;

  let currentGameTime = gameTime;

  let gameTimeInterval = setInterval(() => {
    if (currentGameTime-- == 1) {
      endGame();
      clearInterval(gameTimeInterval);
    }
    gameTimeEl.innerText = `${currentGameTime}s`;
  }, 1000);
}

startButton.addEventListener("click", startGame);
document.getElementById("skipButton").addEventListener("click", nextPrompt);

// keyboard shortcuts
inputWord.addEventListener("keypress", e => {
  if (e.code == "Enter") {
    if (e.shiftKey) {
      nextPrompt();
    } else {
      const word = inputWord.value.toLowerCase();

      if (
        !inputtedWords.includes(word) &&
        word.includes(wordPrompt.innerText) &&
        words.includes(word)
      ) {
        updateScore(true);
        inputtedWords.push(word);
        nextPrompt();
      }
    }
  }
});

document.addEventListener("keypress", e => {
  if (e.code == "Space" && !inGame) startGame();
});

// settings
const settingsBackground = document.getElementById("settingsBackground");
const settingsContainer = document.getElementById("settingsContainer");

document.getElementById("settingsButton").addEventListener("click", () => {
  settingsContainer.style.display = "block";
  settingsBackground.style.display = "block";

  settingsContainer.focus();
});

function exitSettings() {
  settingsContainer.style.display = "none";
  settingsBackground.style.display = "none";

  if (wordsPerPrompt != wordsPerPromptInput.value) {
    wordsPerPrompt = parseInt(wordsPerPromptInput.value);
    currentSyllables = findSyllables(wordsPerPrompt);
  }

  gameTime = gameTimeInput.value;
  promptTime = promptTimeInput.value;
}

settingsBackground.addEventListener("click", exitSettings);
settingsContainer.addEventListener("keydown", e => {
  if (e.key == "Escape") exitSettings();
});
