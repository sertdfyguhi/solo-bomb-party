let wordAmountPerSyllable = 500;

let words, syllables;
let currentSyllables = [];

// get wordlist and syllables from server
(async () => {
  words = (await (await fetch('wordlist.txt')).text()).split('\r\n');
  syllables = await (await fetch('syllables.json')).json();

  for (const count in syllables) {
    if (count >= wordAmountPerSyllable) {
      currentSyllables = currentSyllables.concat(syllables[count]);
    }
  }
})();

const startButton = document.getElementById('startButton');
const inputWord = document.getElementById('inputWord');
const wordPrompt = document.getElementById('wordPrompt');
const promptTimeEl = document.getElementById('promptTime');
const scoreEl = document.getElementById('score');

let promptTime = 1;
let promptTimeInterval;
let inputtedWords = [];

let score = 0;

function nextPrompt() {
  const newSyllable =
    currentSyllables[Math.round(Math.random() * (currentSyllables.length - 1))];

  console.log(newSyllable);

  wordPrompt.innerText = newSyllable;
  inputWord.value = '';

  clearInterval(promptTimeInterval);
  promptTime = 0;
  promptTimeInterval = setInterval(() => {
    if (promptTime == 10) nextPrompt();
    promptTimeEl.innerText = `${promptTime++}s`;
  }, 1000);
}

function startBombParty() {
  startButton.style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';

  nextPrompt();
  inputWord.focus();
}

startButton.addEventListener('click', startBombParty);
inputWord.addEventListener('keypress', e => {
  if (e.key == 'Enter') {
    const word = inputWord.value.toLowerCase();

    if (
      !inputtedWords.includes(word) &&
      word.includes(wordPrompt.innerText) &&
      words.includes(word)
    ) {
      score++;
      scoreEl.innerText = `Score: ${score}`;

      inputtedWords.push(word);
      nextPrompt();
    }
  }
});
