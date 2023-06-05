// get wordlist and syllables from server
const words = (await (await fetch('assets/wordlist.txt')).text()).split('\r\n');
const syllables = await (await fetch('assets/syllables.json')).json();
let currentSyllables = [];

const wordsPerPrompt = document.getElementById('wordsPerPromptInput');
let currentWordsPerPrompt = wordsPerPrompt.value || 500;

function setCurrentSyllables(wordsPerPrompt) {
  currentSyllables = [];

  for (const count in syllables) {
    if (count >= wordsPerPrompt) {
      currentSyllables = currentSyllables.concat(syllables[count]);
    }
  }
}

setCurrentSyllables(currentWordsPerPrompt);

const settingsBackground = document.getElementById('settingsBackground');
const settingsContainer = document.getElementById('settingsContainer');
const startContainer = document.getElementById('startContainer');
const gameContainer = document.getElementById('gameContainer');

const startButton = document.getElementById('startButton');
const wordPrompt = document.getElementById('wordPrompt');
const inputWord = document.getElementById('inputWord');
const gameTimeEl = document.getElementById('gameTime');

const highscoresEl = document.getElementById('highscores');
const finalScoreEl = document.getElementById('finalScore');
const scoreEl = document.getElementById('score');

let promptTimeInterval;
let gameTime = 60;
let inputtedWords = [];

let highscores = localStorage.getItem('highscores') || Array(5).fill(0);
if (typeof highscores == 'string') highscores = highscores.split(';');
loadHighscores();

let score = 0;

function updateScore(plus) {
  plus ? score++ : score--;
  scoreEl.innerText = `Score: ${score}`;
}

function loadHighscores() {
  // reset highscore element
  highscoresEl.innerHTML = '';

  // store highscores into localStorage
  localStorage.setItem('highscores', highscores.join(';'));

  for (const highscore of highscores) {
    const listItem = document.createElement('li');
    listItem.innerText = highscore;

    highscoresEl.appendChild(listItem);
  }
}

function findHighscoreIndex(score) {
  for (const i in highscores) {
    if (highscores[i] < score) {
      return i;
    }
  }

  return i;
}

function nextPrompt() {
  const newSyllable =
    currentSyllables[Math.round(Math.random() * (currentSyllables.length - 1))];

  console.log(newSyllable);

  wordPrompt.innerText = newSyllable;
  inputWord.value = '';

  let promptTime = 0;

  clearInterval(promptTimeInterval);
  promptTimeInterval = setInterval(() => {
    // 8 seconds
    if (promptTime++ == 7) {
      nextPrompt();
      updateScore(false);
    }
  }, 1000);
}

function endGame() {
  clearInterval(promptTimeInterval);

  if (score > highscores[highscores.length - 1]) {
    highscores.splice(findHighscoreIndex(score), 0, score);
    highscores.pop();

    loadHighscores();
  }

  finalScoreEl.innerText = `Final Score: ${score}`;
  score = 0;
  gameTime = 60;
  gameContainer.style.display = 'none';
  startContainer.style.display = 'block';
}

function startGame() {
  startContainer.style.display = 'none';
  gameContainer.style.display = 'block';

  nextPrompt();
  inputWord.focus();
  gameTimeEl.innerText = `${gameTime}s`;

  let gameTimeInterval = setInterval(() => {
    if (gameTime-- == 1) {
      endGame();
      clearInterval(gameTimeInterval);
    }
    gameTimeEl.innerText = `${gameTime}s`;
  }, 1000);
}

startButton.addEventListener('click', startGame);
inputWord.addEventListener('keypress', e => {
  if (e.key == 'Enter') {
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
});

// settings
document.getElementById('settingsButton').addEventListener('click', () => {
  settingsContainer.style.display = 'block';
  settingsBackground.style.display = 'block';

  settingsContainer.focus();
});

function exitSettings() {
  settingsContainer.style.display = 'none';
  settingsBackground.style.display = 'none';

  if (currentWordsPerPrompt != wordsPerPrompt.value) {
    console.log('settings: words per prompt', wordsPerPrompt.value);
    currentWordsPerPrompt = parseInt(wordsPerPrompt.value);
    setCurrentSyllables(currentWordsPerPrompt);
  }
}

settingsBackground.addEventListener('click', exitSettings);
settingsContainer.addEventListener('keydown', e => {
  if (e.key == 'Escape') exitSettings();
});
