// Niveles predefinidos
const LEVELS = [
    {
        grid: ['E', 'E', 'H', 'L', 'D', 'T', 'P', 'N', 'R', 'B', 'F', 'U', 'E', 'T', 'U', 'T'],
        words: ['TUB', 'THE', 'PUN', 'TEE', 'PUT', 'PET', 'PEE', 'NUT', 'FUN', 'BUT', 'BET', 'TUTU', 'TUFT', 'TUBE', 'THEE', 'TEED', 'PEED', 'HEED', 'DEEP', 'BUTE', 'TUBER', 'REBUT', 'DEPTH', 'BERTH', 'TUFTED', 'BERTHED']
    },
    {
        grid: ['J', 'L', 'F', 'I', 'O', 'I', 'H', 'O', 'A', 'N', 'H', 'E', 'O', 'T', 'G', 'G'],
        words: ['TON', 'THE', 'TAO', 'TAN', 'OAT', 'NTH', 'NOT', 'LAT', 'FOE', 'ANT', 'ALL', 'HOE', 'EGG', 'TONG', 'TANG', 'TALL', 'ONTO', 'OATH', 'LONG', 'LATH', 'GNAT', 'FLAT', 'FLAN', 'LOAN', 'LOATH', 'LATHE', 'FOEHN', 'FLOAT', 'ALONG', 'ALLONGE']
    },
    {
        grid: ['T', 'T', 'J', 'I', 'A', 'R', 'D', 'T', 'T', 'T', 'U', 'D', 'G', 'P', 'N', 'E'],
        words: ['TAT', 'RUT', 'RUE', 'RAT', 'PUN', 'PUT', 'PUD', 'NUT', 'END', 'DUE', 'DEN', 'ART', 'RUN', 'DUD', 'DUN', 'TAR', 'TRUE', 'TART', 'RUNT', 'RUED', 'RUDE', 'RUDD', 'PUTT', 'PUNT', 'NURD', 'DUNT', 'DRAT', 'DENT', 'DUDE', 'NUDE', 'RUNE', 'DUNE', 'TUNE', 'TRUED', 'ATTUNE', 'ATTUNED']
    }
];

const GRID_SIZE = 4;
const MIN_WORD_LENGTH = 3;
let GAME_DURATION

let currentLevel = 0;
let grid = [];
let currentWord = '';
let score = 0;
let timer;
let foundWords = new Set();
let remainingWords = new Set();

const boggleGrid = document.getElementById('boggle-grid');
const currentWordEl = document.getElementById('current-word');
const timerEl = document.getElementById('time-left');
const scoreEl = document.querySelector('#current-score span');
const wordListEl = document.querySelector('#word-list ul');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreEl = document.getElementById('final-score');
const playAgainBtn = document.getElementById('play-again');
const currentLevelEl = document.querySelector('#current-level span');
const wordsRemainingEl = document.getElementById('words-remaining');

function initGame() {
    loadLevel(currentLevel);
    renderGrid();
    startTimer();
    setupEventListeners();
    updateWordsRemaining();
}

function loadLevel(levelIndex) {
    grid = LEVELS[levelIndex].grid;
    remainingWords = new Set(LEVELS[levelIndex].words);
    foundWords.clear();
    score = 0;
    currentLevelEl.textContent = levelIndex + 1;
    scoreEl.textContent = '0';
    wordListEl.innerHTML = '';
}

function renderGrid() {
    const cells = boggleGrid.querySelectorAll('.grid-cell');
    cells.forEach((cell, index) => {
        const letter = grid[index];
        cell.textContent = letter;
        cell.dataset.row = Math.floor(index / GRID_SIZE);
        cell.dataset.col = index % GRID_SIZE;
    });
}

function startTimer() {
    let timeLeft = GAME_DURATION;
    updateTimer(timeLeft);
    timer = setInterval(() => {
        timeLeft--;
        updateTimer(timeLeft);
        if (timeLeft === 0) {
            endLevel();
        }
    }, 1000);
}

function updateTimer(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function setupEventListeners() {
    boggleGrid.addEventListener('mousedown', startWordSelection);
    boggleGrid.addEventListener('mouseover', continueWordSelection);
    boggleGrid.addEventListener('mouseup', endWordSelection);
    document.addEventListener('mouseup', endWordSelection);

    boggleGrid.addEventListener('touchstart', startWordSelection);
    boggleGrid.addEventListener('touchmove', continueWordSelection);
    boggleGrid.addEventListener('touchend', endWordSelection);

    playAgainBtn.addEventListener('click', restartGame);
}

function startWordSelection(e) {
    if (e.target.classList.contains('grid-cell')) {
        currentWord = e.target.textContent;
        e.target.classList.add('selected');
        selectedCells = [{ 
            row: parseInt(e.target.dataset.row),
            col: parseInt(e.target.dataset.col)
        }];
        updateCurrentWord();
    }
}

function continueWordSelection(e) {
    if (e.buttons === 1 && e.target.classList.contains('grid-cell') && !e.target.classList.contains('selected')) {
        const newRow = parseInt(e.target.dataset.row);
        const newCol = parseInt(e.target.dataset.col);
        
        if (isValidNextCell(newRow, newCol)) {
            currentWord += e.target.textContent;
            e.target.classList.add('selected');
            selectedCells.push({ row: newRow, col: newCol });
            updateCurrentWord();
        }
    }
}

function isValidNextCell(row, col) {
    if (selectedCells.length === 0) return true;
    
    const lastCell = selectedCells[selectedCells.length - 1];
    const rowDiff = Math.abs(row - lastCell.row);
    const colDiff = Math.abs(col - lastCell.col);
    
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
}

function endWordSelection() {
    if (currentWord.length >= MIN_WORD_LENGTH) {
        validateWord(currentWord);
    }
    resetSelection();
}

function updateCurrentWord() {
    currentWordEl.textContent = currentWord;
}

function validateWord(word) {
    if (remainingWords.has(word) && !foundWords.has(word)) {
        foundWords.add(word);
        remainingWords.delete(word);
        updateScore(word);
        addWordToList(word);
        updateWordsRemaining();
        
        // pasa de nivel si se encuentran 10 palabras
        if (foundWords.size === 10) {
            endLevel();
        }
    }
}

function updateScore(word) {
    score += word.length;
    scoreEl.textContent = score;
}

function addWordToList(word) {
    const li = document.createElement('li');
    li.textContent = word;
    wordListEl.appendChild(li);
}

function resetSelection() {
    currentWord = '';
    updateCurrentWord();
    boggleGrid.querySelectorAll('.grid-cell').forEach(cell => cell.classList.remove('selected'));
    selectedCells = [];
}

function updateWordsRemaining() {
    wordsRemainingEl.textContent = remainingWords.size;
}

function endLevel() {
    clearInterval(timer);
    if (currentLevel < LEVELS.length - 1) {
        currentLevel++;
        initGame();
    } else {
        endGame();
    }
}

function endGame() {
    finalScoreEl.textContent = score;
    // show modal
    gameOverModal.style.display = 'flex';
}

function restartGame() {
    currentLevel = 0;
    score = 0;
    // hide modal
    gameOverModal.style.display = 'none';
    initGame();
}

document.addEventListener('DOMContentLoaded', function() {
    var playerNameInput = document.getElementById('player-name');

    if (localStorage.getItem('gameTime')) {
        GAME_DURATION = localStorage.getItem('gameTime') * 60;
    } else {
        GAME_DURATION = 180;
    }

    if (localStorage.getItem('playerName')) {
        playerNameInput.innerHTML = "Jugador: " + localStorage.getItem('playerName');
    }

    initGame();
});