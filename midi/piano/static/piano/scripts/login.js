document.addEventListener('DOMContentLoaded', function() {
    const usernameBox = document.querySelector('#username');
    const errors = document.querySelectorAll('.invalid-feedback');
    const passwordBox = document.querySelector('#password');

    usernameBox.addEventListener('input', function() {
        // clear feedback
        errors.forEach(error => {
            error.innerHTML = "";
        });

        if (usernameBox.classList.contains('is-invalid')) {
            usernameBox.classList.remove('is-invalid');
        }
        if (passwordBox.classList.contains('is-invalid')) {
            passwordBox.classList.remove('is-invalid');
        }
    });

    passwordBox.addEventListener('input', function() {
        // clear feedback
        errors.forEach(error => {
            error.innerHTML = "";
        });

        if (passwordBox.classList.contains('is-invalid')) {
            passwordBox.classList.remove('is-invalid');
        }
        if (usernameBox.classList.contains('is-invalid')) {
            usernameBox.classList.remove('is-invalid');
        }
    });
});