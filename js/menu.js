document.addEventListener('DOMContentLoaded', function() {
    var playerForm = document.getElementById('player-form');
    var playerNameInput = document.getElementById('player-name');
    var timerSelect = document.getElementById('timer');
    var randomButton = document.getElementById('random-mode');
    var levelsButton = document.getElementById('levels-mode');
    var validationMessage = document.getElementById('validation-message');

    if(localStorage.getItem('playerName')) {
        playerNameInput.value = localStorage.getItem('playerName');
    }
    if(localStorage.getItem('gameTime')) {
        timerSelect.value = localStorage.getItem('gameTime');
    }

    function validatePlayerName() {
        var name = playerNameInput.value.trim();
        if (name.length === 0) {
            validationMessage.textContent = 'El nombre del jugador no puede estar vacío.';
            return false;
        } else if (name.length < 3) {
            validationMessage.textContent = 'El nombre del jugador debe tener al menos 3 caracteres.';
            return false;
        } else {
            validationMessage.textContent = '';
            return true;
        }
    }

    function handleSubmit(event, destination) {
        event.preventDefault();
        
        if (validatePlayerName()) {
            localStorage.setItem('playerName', playerNameInput.value.trim());
            localStorage.setItem('gameTime', timerSelect.value);
            window.location.href = destination;
        }
    }

    randomButton.addEventListener('click', function(event) {
        handleSubmit(event, 'random.html');
    });

    levelsButton.addEventListener('click', function(event) {
        handleSubmit(event, 'levels.html');
    });
});