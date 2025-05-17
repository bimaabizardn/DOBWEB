// auth.js

let registrationToken = ''; // Untuk menyimpan token registrasi

// Fungsi untuk mengecek autentikasi
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Jika bukan di halaman login dan tidak ada token, redirect ke login
    if (currentPage !== 'index.html' && !token) {
        window.location.href = 'index.html';
        return false;
    }
    
    // Jika di halaman login dan ada token, redirect ke dashboard
    if (currentPage === 'index.html' && token) {
        window.location.href = 'dashboard.html';
        return false;
    }
    
    return true;
}

// Event listener untuk mengecek autentikasi setiap halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Handle toggle between login and register forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const otpForm = document.getElementById('otp-form');
    const showRegisterLink = document.getElementById('showRegister');
    const backToLoginBtn = document.getElementById('backToLogin');
    const backToRegisterBtn = document.getElementById('backToRegister');
    const formTitle = document.getElementById('formTitle');

    // Show register form
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            otpForm.style.display = 'none';
            formTitle.textContent = 'Register';
        });
    }

    // Back to login form
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => {
            registerForm.style.display = 'none';
            otpForm.style.display = 'none';
            loginForm.style.display = 'block';
            formTitle.textContent = 'Login';
        });
    }

    // Back to register from OTP form
    if (backToRegisterBtn) {
        backToRegisterBtn.addEventListener('click', () => {
            otpForm.style.display = 'none';
            registerForm.style.display = 'block';
            formTitle.textContent = 'Register';
        });
    }

    // Handle login form
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginMessage = document.getElementById('login-message');
            const loading = document.getElementById('loading');

            try {
                loading.style.display = 'block';
                const response = await fetch('https://agile-scheme-424018-g8.et.r.appspot.com/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Login failed');
                }

                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userEmail', email);
                window.location.href = 'dashboard.html';
            } catch (error) {
                loginMessage.textContent = error.message;
            } finally {
                loading.style.display = 'none';
            }
        });
    }

    // Handle register form
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nama = document.getElementById('reg-nama').value;
            const email = document.getElementById('reg-email').value;
            const nomor_telepon = document.getElementById('reg-phone').value;
            const role = document.getElementById('reg-role').value;
            const password = document.getElementById('reg-password').value;
            const konfirmasi_password = document.getElementById('reg-confirm-password').value;
            const registerMessage = document.getElementById('register-message');
            const loading = document.getElementById('loading');

            // Validasi password
            if (password !== konfirmasi_password) {
                registerMessage.textContent = 'Password and confirmation password do not match';
                return;
            }

            try {
                loading.style.display = 'block';
                const response = await fetch('https://agile-scheme-424018-g8.et.r.appspot.com/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nama,
                        email,
                        nomor_telepon,
                        role,
                        password,
                        konfirmasi_password
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Registration failed');
                }

                const data = await response.json();
                registrationToken = data.token; // Simpan token registrasi

                // Show OTP form
                registerForm.style.display = 'none';
                otpForm.style.display = 'block';
                formTitle.textContent = 'Verify OTP';
                document.getElementById('otp-message').textContent = 'Please enter the OTP sent to your email';

            } catch (error) {
                registerMessage.className = 'text-danger mt-3';
                registerMessage.textContent = error.message;
            } finally {
                loading.style.display = 'none';
            }
        });
    }

    // Handle OTP verification
    if (otpForm) {
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const otp = document.getElementById('otp-input').value;
            const otpMessage = document.getElementById('otp-message');
            const loading = document.getElementById('loading');

            try {
                loading.style.display = 'block';
                const response = await fetch('https://agile-scheme-424018-g8.et.r.appspot.com/verify-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        otp,
                        registrationToken
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'OTP verification failed');
                }

                otpMessage.className = 'text-success mt-3';
                otpMessage.textContent = 'Registration successful! Please login.';

                // Reset forms and switch to login after 2 seconds
                setTimeout(() => {
                    registerForm.reset();
                    otpForm.reset();
                    otpForm.style.display = 'none';
                    loginForm.style.display = 'block';
                    formTitle.textContent = 'Login';
                    otpMessage.textContent = '';
                }, 2000);

            } catch (error) {
                otpMessage.className = 'text-danger mt-3';
                otpMessage.textContent = error.message;
            } finally {
                loading.style.display = 'none';
            }
        });
    }

    // Handle resend OTP
    const resendOtpLink = document.getElementById('resendOtp');
    if (resendOtpLink) {
        resendOtpLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const otpMessage = document.getElementById('otp-message');
            const loading = document.getElementById('loading');

            try {
                loading.style.display = 'block';
                const response = await fetch('https://agile-scheme-424018-g8.et.r.appspot.com/resend-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        registrationToken
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to resend OTP');
                }

                otpMessage.className = 'text-success mt-3';
                otpMessage.textContent = 'New OTP has been sent to your email';

            } catch (error) {
                otpMessage.className = 'text-danger mt-3';
                otpMessage.textContent = error.message;
            } finally {
                loading.style.display = 'none';
            }
        });
    }
});