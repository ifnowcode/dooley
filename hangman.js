// ------------------------------------------------------------
// 1. PIPELINE DEFINITIONS (You can add/remove/edit these)
// ------------------------------------------------------------
console.log("🔊⏳");
/*
const pipelines = {
  "DictionaryAPI": {
    name: "DictionaryAPI",
    async getWord() {
      // Example: random word from random-word-api
      const res = await fetch("https://random-word-api.herokuapp.com/word");
      const data = await res.json();
      return data[0].toLowerCase();
    },
    async getDefinition(word) {
      // Example: dictionaryapi.dev
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!res.ok) return { definition: "No definition found." };
      const data = await res.json();
      const entry = data[0];
      return {
        definition: entry.meanings?.[0]?.definitions?.[0]?.definition || "No definition found.",
        partOfSpeech: entry.meanings?.[0]?.partOfSpeech || "",
        phonetic: entry.phonetic || ""
      };
    }
  },

  // Add your own pipelines here:
  // "MyCustomAPI": { getWord(){...}, getDefinition(word){...} }
};
*/
// ------------------------------------------------------------
// 2. GAME STATE
// ------------------------------------------------------------
let secretWord = "";
let guessed = new Set();

// ------------------------------------------------------------
// 3. UI SETUP
// ------------------------------------------------------------
const apiSelect = document.getElementById("apiSelect");
const newBtn = document.getElementById("newBtn");
const hangmanEl = document.getElementById("hangman");
const wordEl = document.getElementById("word");
const lettersEl = document.getElementById("letters");
const definitionEl = document.getElementById("definition");

// Populate dropdown
for (const key in pipelines) {
  const opt = document.createElement("option");
  opt.value = key;
  opt.textContent = pipelines[key].name;
  apiSelect.appendChild(opt);
}

// ------------------------------------------------------------
// 4. HANGMAN DRAWING (ASCII)
// ------------------------------------------------------------
function drawHangman() {
  const stages = [
    `




    =========`,

    `
     |
     |
     |
     |
    =========`,

    `
     +---+
     |
     |
     |
     |
    =========`,

    `
     +---+
     |   O
     |
     |
     |
    =========`,

    `
     +---+
     |   O
     |   |
     |
     |
    =========`,

    `
     +---+
     |   O
     |  /|
     |
     |
    =========`,

    `
     +---+
     |   O
     |  /|\\
     |
     |
    =========`,

    `
     +---+
     |   O
     |  /|\\
     |  /
     |
    =========`,

    `
     +---+
     |   O
     |  /|\\
     |  / \\
     |
    =========`,
    
    `
     +---+
     |   O
     |  /|\\
     |  / \\
     |
    =========`,
    
    `
     +---+
     |   O
     |  /|\\
     |   |
     |  / \\
     |
    =========`
  ];

  hangmanEl.textContent = stages[wrong];
  
  return stages.length
}

let wrong = 0;
const MAX_WRONG = 8;

// ------------------------------------------------------------
// 5. RENDER WORD
// ------------------------------------------------------------
function renderWord() {
  let display = "";
  for (const ch of secretWord) {
    display += guessed.has(ch) ? ch + " " : "_ ";
  }
  wordEl.textContent = display.trim();
}

// ------------------------------------------------------------
// 6. LETTER BUTTONS
// ------------------------------------------------------------
function renderLetters() {
  lettersEl.innerHTML = "";
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i).toLowerCase();
    const btn = document.createElement("button");
    btn.textContent = letter;
    btn.disabled = guessed.has(letter) || wrong >= MAX_WRONG;
    btn.onclick = () => guess(letter);
    lettersEl.appendChild(btn);
  }
}

// ------------------------------------------------------------
// 7. GUESS LOGIC
// ------------------------------------------------------------
function guess(letter) {
  guessed.add(letter);

  if (!secretWord.includes(letter)) {
    wrong++;
  }

  drawHangman();
  renderWord();
  renderLetters();

  if (wrong >= MAX_WRONG) {
    endGame(false);
  } else if (secretWord.split("").every(ch => guessed.has(ch))) {
    endGame(true);
  }
}

// ------------------------------------------------------------
// 8. END GAME
// ------------------------------------------------------------
async function endGame(win) {
  lettersEl.innerHTML = "";
  wordEl.textContent = win ? secretWord : `The word was: ${secretWord}`;

  const pipeline = pipelines[apiSelect.value];
  const info = await pipeline.getDefinition(secretWord);

  definitionEl.innerHTML = `
    <h3>${secretWord}</h3>
    <p><strong>Definition:</strong> ${info.definition}</p>
    ${info.partOfSpeech ? `<p><strong>Part of Speech:</strong> ${info.partOfSpeech}</p>` : ""}
    ${info.phonetic ? `<p><strong>Phonetic:</strong> ${info.phonetic}</p>` : ""}
  `;
}

// ------------------------------------------------------------
// 9. NEW GAME
// ------------------------------------------------------------
async function newGame() {
  const pipeline = pipelines[apiSelect.value];
  console.log("Pipeline:", pipeline);
  definitionEl.innerHTML = "";
  guessed.clear();
  wrong = 0;

  secretWord = await pipeline.getWord();
  secretWord = secretWord.toLowerCase().replace(/[^a-z]/g, "");

  drawHangman();
  renderWord();
  renderLetters();
}

newBtn.onclick = newGame;
newGame();