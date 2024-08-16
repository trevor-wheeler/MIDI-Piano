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
    const passwordBox = document.querySelector('#password');
    const passwordError = document.querySelector('#password-feedback');
    const newPasswordBox = document.querySelector('#new-password');
    const NewPasswordError = document.querySelector('#new-password-feedback');
    const confirmNewPasswordBox = document.querySelector('#confirm-new-password');
    const confirmNewPasswordError = document.querySelector('#confirm-new-password-feedback');

    passwordBox.addEventListener('input', function() {
        let password = passwordBox.value;
        
        // Remove existing css
        removeCSS(passwordBox);

        // Clear feedback
        passwordError.innerHTML = "";

        // Return feedback if password field is empty
        if (!password) {
            passwordBox.classList.add('is-invalid');
            passwordError.innerHTML = "Required.";
        }
    });

    newPasswordBox.addEventListener('input', function() {
        let password = newPasswordBox.value;
        let confirmPassword = confirmNewPasswordBox.value;
        
        // Remove existing css
        removeCSS(newPasswordBox);

        // Clear feedback
        NewPasswordError.innerHTML = "";

        // Return feedback if password field is empty
        if (!password) {
            newPasswordBox.classList.add('is-invalid');
            NewPasswordError.innerHTML = "Required.";
        }
        // Passwords dont match
        else if (confirmPassword && password !== confirmPassword) {
            removeCSS(confirmNewPasswordBox);
            newPasswordBox.classList.add('is-invalid');
            confirmNewPasswordBox.classList.add('is-invalid');
        }
        // Display green check mark when passwords match
        else if (confirmPassword && password === confirmPassword) {
            removeCSS(confirmNewPasswordBox);
            confirmNewPasswordError.innerHTML = ""
            newPasswordBox.classList.add('is-valid');
            confirmNewPasswordBox.classList.add('is-valid');
        }
        else if (!confirmPassword && confirmNewPasswordError.innerHTML) {
            newPasswordBox.classList.add('is-invalid');
        }
    });

    confirmNewPasswordBox.addEventListener('input', function() {
        let password = newPasswordBox.value;
        let confirmPassword = confirmNewPasswordBox.value;
        
        // Remove existing css
        removeCSS(confirmNewPasswordBox);

        // Clear feedback
        confirmNewPasswordError.innerHTML = "";

        // Return feedback if confirm passowrd field is empty
        if (!confirmPassword) {
            confirmNewPasswordBox.classList.add('is-invalid');
            confirmNewPasswordError.innerHTML = "Required.";
        }
        // Passwords dont match
        else if (confirmPassword !== password) {
            removeCSS(newPasswordBox);
            newPasswordBox.classList.add('is-invalid');
            confirmNewPasswordBox.classList.add('is-invalid');
            // If password field is empty return feedback
            if (!password) {
                NewPasswordError.innerHTML = "Required.";
            }
        }
        // Display green check mark when passwords match
        else if (confirmPassword === password) {
            removeCSS(newPasswordBox);
            NewPasswordError.innerHTML = ""
            newPasswordBox.classList.add('is-valid');
            confirmNewPasswordBox.classList.add('is-valid');
        }
    });
}