document.addEventListener('DOMContentLoaded', function() {
    var playerForm = document.getElementById('player-form');
    var playerNameInput = document.getElementById('player-name');
    var timerSelect = document.getElementById('timer');
    var randomButton = document.getElementById('random-mode');
    var levelsButton = document.getElementById('levels-mode');

    if(localStorage.getItem('playerName')) {
        playerNameInput.value = localStorage.getItem('playerName');
    }
    if(localStorage.getItem('gameTime')) {
        timerSelect.value = localStorage.getItem('gameTime');
    }

    playerNameInput.addEventListener('input', function() {
        if (playerNameInput.validity.tooShort) {
            playerNameInput.setCustomValidity('El nombre del jugador debe tener al menos 3 caracteres.');
        } else {
            playerNameInput.setCustomValidity('');
        }
    });

    function handleSubmit(event, destination) {
        event.preventDefault();
        
        if (playerForm.checkValidity()) {
            localStorage.setItem('playerName', playerNameInput.value.trim());
            localStorage.setItem('gameTime', timerSelect.value);
            window.location.href = destination;
        } else {
            playerForm.reportValidity();
        }
    }

    randomButton.addEventListener('click', function(event) {
        handleSubmit(event, 'random.html');
    });

    levelsButton.addEventListener('click', function(event) {
        handleSubmit(event, 'levels.html');
    });
});