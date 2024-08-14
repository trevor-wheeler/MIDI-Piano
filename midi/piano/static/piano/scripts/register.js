document.addEventListener('DOMContentLoaded', main);

function removeCSS(element) {
    if (element.classList.contains('is-valid')) {
        element.classList.remove('is-valid');
    }
    else if (element.classList.contains('is-invalid')) {
        element.classList.remove('is-invalid');
    }
}

function main() {
    const usernameBox = document.querySelector('#username');
    const usernameError = document.querySelector('#username-feedback');
    const passwordBox = document.querySelector('#password');
    const passwordError = document.querySelector('#password-feedback');
    const confirmPasswordBox = document.querySelector('#confirm-password');
    const confirmPasswordError = document.querySelector('#confirm-password-feedback');

    usernameBox.addEventListener('input', function() {
        let username = usernameBox.value;
        
        // Remove existing css
        removeCSS(usernameBox);

        // Clear feedback
        usernameError.innerHTML = "";

        // Return feedback if username field is empty
        if (!username) {
            usernameBox.classList.add('is-invalid');
            usernameError.innerHTML = "Username required.";
        }
        // Return feedback if username is longer than 12 characters
        else if (username.length > 12) {
            usernameBox.classList.add('is-invalid');
            usernameError.innerHTML = "Username too long.";
        }
        // Return feedback if username is using invalid characters
        else if (!/^[a-z0-9]+$/i.test(username)) {
            usernameBox.classList.add('is-invalid');
            usernameError.innerHTML = "Invalid characters.";
        }
    });

    usernameBox.addEventListener('blur', function() {
        let username = usernameBox.value;
        
        // Check server for username availability
        if (!usernameBox.classList.contains('is-valid') && !usernameBox.classList.contains('is-invalid')) {
            if (username) {
                fetch(`api/user/${username}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        usernameBox.classList.add('is-invalid');
                        usernameError.innerHTML = "Username taken.";
                    }
                    else {
                        usernameBox.classList.add('is-valid');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }
        }
    });

    passwordBox.addEventListener('input', function() {
        let password = passwordBox.value;
        let confirmPassword = confirmPasswordBox.value;
        
        // Remove existing css
        removeCSS(passwordBox);

        // Clear feedback
        passwordError.innerHTML = "";

        // Return feedback if password field is empty
        if (!password) {
            passwordBox.classList.add('is-invalid');
            passwordError.innerHTML = "Password required.";
        }
        // Passwords dont match
        else if (confirmPassword && password !== confirmPassword) {
            removeCSS(confirmPasswordBox);
            passwordBox.classList.add('is-invalid');
            confirmPasswordBox.classList.add('is-invalid');
        }
        // Display green check mark when passwords match
        else if (confirmPassword && password === confirmPassword) {
            removeCSS(confirmPasswordBox);
            confirmPasswordError.innerHTML = ""
            passwordBox.classList.add('is-valid');
            confirmPasswordBox.classList.add('is-valid');
        }
        else if (!confirmPassword && confirmPasswordError.innerHTML) {
            passwordBox.classList.add('is-invalid');
        }
    });

    confirmPasswordBox.addEventListener('input', function() {
        let password = passwordBox.value;
        let confirmPassword = confirmPasswordBox.value;
        
        // Remove existing css
        removeCSS(confirmPasswordBox);

        // Clear feedback
        confirmPasswordError.innerHTML = "";

        // Return feedback if confirm passowrd field is empty
        if (!confirmPassword) {
            confirmPasswordBox.classList.add('is-invalid');
            confirmPasswordError.innerHTML = "Confirmation required.";
        }
        // Passwords dont match
        else if (confirmPassword !== password) {
            removeCSS(passwordBox);
            passwordBox.classList.add('is-invalid');
            confirmPasswordBox.classList.add('is-invalid');
            // If password field is empty return feedback
            if (!password) {
                passwordError.innerHTML = "Password required.";
            }
        }
        // Display green check mark when passwords match
        else if (confirmPassword === password) {
            removeCSS(passwordBox);
            passwordError.innerHTML = ""
            passwordBox.classList.add('is-valid');
            confirmPasswordBox.classList.add('is-valid');
        }
    });

}