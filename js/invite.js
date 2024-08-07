var form = document.getElementById('form');

var nameError = document.getElementById('name-error');
var emailError = document.getElementById('email-error');
var messageError = document.getElementById('message-error');

document.addEventListener('DOMContentLoaded', function() {
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        var name = document.getElementById('name').value;
        var email = document.getElementById('email').value;
        var message = document.getElementById('message').value;
        
        if (validateForm(name, email, message)) {
            send(name, email, message);
        }
    });
});

function validateForm(nombre, email, message) {
    // Reset errores
    nameError.textContent = '';
    emailError.textContent = '';
    messageError.textContent = '';

    if (!/^[a-zA-Z0-9\s]+$/.test(nombre)) {
        nameError.textContent = 'Ingrese un nombre válido.';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = 'Ingrese un email válido.';
    }

    if (message.length <= 5) {
        messageError.textContent = 'El mensaje debe tener al menos 5 caracteres.';
    }
    
    // permitir todos los errores al mismo tiempo
    if (nameError.textContent || emailError.textContent || messageError.textContent) {
        return false;
    }

    return true;
}

function send(name, email, message) {
    var subject = `Te invito a jugar a Boggle ${name}`;

    var mailtoLink = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoLink;
}