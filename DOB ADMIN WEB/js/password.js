// password.js

document.addEventListener('DOMContentLoaded', () => {
    // Function untuk mengatur toggle password visibility
    function setupPasswordToggle(toggleId, passwordId) {
        const toggleButton = document.querySelector(toggleId);
        const passwordInput = document.querySelector(passwordId);

        if (toggleButton && passwordInput) {
            toggleButton.addEventListener('click', function() {
                // Toggle tipe input
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Toggle icon
                const icon = this.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        }
    }

    // Setup untuk password di form login
    setupPasswordToggle('#togglePassword', '#password');
    
    // Setup untuk password di form register
    setupPasswordToggle('#toggleRegPassword', '#reg-password');
    setupPasswordToggle('#toggleRegConfirmPassword', '#reg-confirm-password');
});