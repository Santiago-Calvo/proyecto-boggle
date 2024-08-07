'use strict'

// Config
const GRID_SIZE = 4;
const MIN_WORD_LENGTH = 3;
let GAME_DURATION;
let grid = [];
let currentWord = '';
let score = 0;
let timer;
let foundWords = new Set();
let selectedCells = [];

const boggleGrid = document.getElementById('boggle-grid');
const currentWordEl = document.getElementById('current-word');
const timerEl = document.getElementById('time-left');
const scoreEl = document.querySelector('#current-score span');
const wordListEl = document.querySelector('#word-list ul');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreEl = document.getElementById('final-score');
const playAgainBtn = document.getElementById('play-again');

// Letter distribution adapted from https://en.wikipedia.org/wiki/Letter_frequency
const LETTER_DISTRIBUTION = {
    'A': 9, 'B': 2, 'C': 2, 'D': 4, 'E': 12, 'F': 2, 'G': 3, 'H': 2, 'I': 9,
    'J': 1, 'K': 1, 'L': 4, 'M': 2, 'N': 6, 'O': 8, 'P': 2, 'Qu': 1, 'R': 6,
    'S': 4, 'T': 6, 'U': 4, 'V': 2, 'W': 2, 'X': 1, 'Y': 2, 'Z': 1
};

function initGame() {
    generateGrid();
    renderGrid();
    startTimer();
    setupEventListeners();
}

function generateGrid() {
    const letters = [];
    for (const [letter, frequency] of Object.entries(LETTER_DISTRIBUTION)) {
        letters.push(...Array(frequency).fill(letter));
    }
    
    grid = [];
    for (var i = 0; i < GRID_SIZE; i++) {
        const row = [];
        for (var j = 0; j < GRID_SIZE; j++) {
            const randomIndex = Math.floor(Math.random() * letters.length);
            const letter = letters.splice(randomIndex, 1)[0];
            row.push(letter);
        }
        grid.push(row);
    }
}

function renderGrid() {
    const cells = boggleGrid.querySelectorAll('.grid-cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;
        const letter = grid[row][col];
        cell.textContent = letter;
        cell.dataset.row = row;
        cell.dataset.col = col;
    });
}

function startTimer() {
    var timeLeft = GAME_DURATION;
    updateTimer(timeLeft);
    timer = setInterval(() => {
        timeLeft--;
        updateTimer(timeLeft);
        if (timeLeft === 0) {
            endGame();
        }
    }, 1000);
}

function updateTimer(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function setupEventListeners() {
    boggleGrid.addEventListener('click', handleCellClick);
    playAgainBtn.addEventListener('click', restartGame);
    document.addEventListener('click', handleClickOutside);
}

function handleCellClick(e) {
    if (e.target.classList.contains('grid-cell')) {
        const newRow = parseInt(e.target.dataset.row);
        const newCol = parseInt(e.target.dataset.col);
        
        if (selectedCells.length === 0 || isValidNextCell(newRow, newCol)) {
            e.target.classList.add('selected');
            selectedCells.push({ row: newRow, col: newCol });
            currentWord += e.target.textContent === 'Qu' ? 'Qu' : e.target.textContent;
            updateCurrentWord();
        } else if (selectedCells.length > 1 && newRow === selectedCells[selectedCells.length - 2].row && newCol === selectedCells[selectedCells.length - 2].col) {
            const lastCell = selectedCells.pop();
            document.querySelector(`.grid-cell[data-row="${lastCell.row}"][data-col="${lastCell.col}"]`).classList.remove('selected');
            currentWord = currentWord.slice(0, -1);
            updateCurrentWord();
        } else {
            resetSelection(); 
        }
    }
}

function handleClickOutside(e) {
    if (!boggleGrid.contains(e.target)) {       
        resetSelection();
    }
}

function isValidNextCell(row, col) {
    if (selectedCells.length === 0) return true;
    
    const lastCell = selectedCells[selectedCells.length - 1];
    const rowDiff = Math.abs(row - lastCell.row);
    const colDiff = Math.abs(col - lastCell.col);
    
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0) && !isCellAlreadySelected(row, col);
}

function isCellAlreadySelected(row, col) {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
}

function updateCurrentWord() {
    currentWordEl.textContent = currentWord;
    if (currentWord.length >= MIN_WORD_LENGTH) {
        validateWord(currentWord);
    }
}

async function validateWord(word) {
    
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        const data = await response.json();
        
        if (response.ok && data.length > 0) {
            if (!foundWords.has(word)) {
                foundWords.add(word);
                updateScore(word);
                addWordToList(word);
                resetSelection();
            }           
        } else {
            updateScore(word, true);
        }
    } catch (error) {
        console.error('Error validating word:', error);
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

function endGame() {
    clearInterval(timer);
    finalScoreEl.textContent = score;
    gameOverModal.style.display = 'flex';
}

function restartGame() {
    score = 0;
    foundWords.clear();
    wordListEl.innerHTML = '';
    scoreEl.textContent = '0';
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