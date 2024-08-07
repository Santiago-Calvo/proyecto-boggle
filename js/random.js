'use strict'

// Config
var GRID_SIZE = 4;
var MIN_WORD_LENGTH = 3;
var GAME_DURATION;
var grid = [];
var currentWord = '';
var score = 0;
var timer;
var foundWords = new Set();
var selectedCells = [];

var boggleGrid = document.getElementById('boggle-grid');
var currentWordEl = document.getElementById('current-word');
var timerEl = document.getElementById('time-left');
var scoreEl = document.querySelector('#current-score span');
var wordListEl = document.querySelector('#word-list ul');
var gameOverModal = document.getElementById('game-over-modal');
var finalScoreEl = document.getElementById('final-score');
var playAgainBtn = document.getElementById('play-again');

// Letter distribution adapted from https://en.wikipedia.org/wiki/Letter_frequency
var LETTER_DISTRIBUTION = {
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
    var letters = [];
    for (var [letter, frequency] of Object.entries(LETTER_DISTRIBUTION)) {
        letters.push(...Array(frequency).fill(letter));
    }
    
    grid = [];
    for (var i = 0; i < GRID_SIZE; i++) {
        var row = [];
        for (var j = 0; j < GRID_SIZE; j++) {
            var randomIndex = Math.floor(Math.random() * letters.length);
            var letter = letters.splice(randomIndex, 1)[0];
            row.push(letter);
        }
        grid.push(row);
    }
}

function renderGrid() {
    var cells = boggleGrid.querySelectorAll('.grid-cell');
    cells.forEach((cell, index) => {
        var row = Math.floor(index / GRID_SIZE);
        var col = index % GRID_SIZE;
        var letter = grid[row][col];
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

        if (timeLeft <= 10) {
            timerEl.classList.add('time-running-out');
        }

        if (timeLeft === 0) {
            timerEl.classList.remove('time-running-out');
            endGame();
        }
    }, 1000);
}

function updateTimer(time) {
    var minutes = Math.floor(time / 60);
    var seconds = time % 60;
    timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function setupEventListeners() {
    boggleGrid.addEventListener('click', handleCellClick);
    playAgainBtn.addEventListener('click', restartGame);
    document.addEventListener('click', handleClickOutside);
}

function handleCellClick(e) {
    if (e.target.classList.contains('grid-cell')) {
        var newRow = parseInt(e.target.dataset.row);
        var newCol = parseInt(e.target.dataset.col);
        
        if (selectedCells.length === 0 || isValidNextCell(newRow, newCol)) {
            e.target.classList.add('selected');
            selectedCells.push({ row: newRow, col: newCol });
            currentWord += e.target.textContent === 'Qu' ? 'Qu' : e.target.textContent;
            updateCurrentWord();
            highlightValidCells();
        } else if (selectedCells.length > 1 && newRow === selectedCells[selectedCells.length - 2].row && newCol === selectedCells[selectedCells.length - 2].col) {
            var lastCell = selectedCells.pop();
            document.querySelector(`.grid-cell[data-row="${lastCell.row}"][data-col="${lastCell.col}"]`).classList.remove('selected');
            currentWord = currentWord.slice(0, -1);
            updateCurrentWord();
            highlightValidCells();
        } else {
            resetSelection(); 
        }
    }
}

function highlightValidCells() {
    boggleGrid.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.remove('valid-next');
    });

    if (selectedCells.length > 0) {
        var lastCell = selectedCells[selectedCells.length - 1];
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                var newRow = lastCell.row + i;
                var newCol = lastCell.col + j;
                if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
                    var cell = boggleGrid.querySelector(`.grid-cell[data-row="${newRow}"][data-col="${newCol}"]`);
                    if (cell && !cell.classList.contains('selected')) {
                        cell.classList.add('valid-next');
                    }
                }
            }
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
    
    var lastCell = selectedCells[selectedCells.length - 1];
    var rowDiff = Math.abs(row - lastCell.row);
    var colDiff = Math.abs(col - lastCell.col);
    
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

function validateWord(word) {

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`).then(response => {
        if (response.ok) {
            if (!foundWords.has(word)) {
                foundWords.add(word);
                updateScore(word);
                addWordToList(word);
                resetSelection();
            }           
        } else {
            updateScore(word, true);
        }
    }).catch(error => {
        console.error('Error:', error);
    })
}

function updateScore(word, penalty = false) {
    if (penalty) {
        score -= word.length;
    } else {
        score += word.length;
    }

    scoreEl.textContent = score;
}

function addWordToList(word) {
    var li = document.createElement('li');
    li.textContent = word;
    wordListEl.appendChild(li);
}

function resetSelection() {
    currentWord = '';
    updateCurrentWord();
    boggleGrid.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.remove('selected');
        cell.classList.remove('valid-next');
    });
    selectedCells = [];
}

function endGame() {
    clearInterval(timer);
    finalScoreEl.textContent = score;
    gameOverModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function restartGame() {
    score = 0;
    foundWords.clear();
    wordListEl.innerHTML = '';
    scoreEl.textContent = '0';
    gameOverModal.style.display = 'none';
    document.body.style.overflow = 'auto';
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