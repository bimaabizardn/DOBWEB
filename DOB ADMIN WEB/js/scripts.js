// scripts.js

// Fungsi untuk mengecek apakah user sudah terautentikasi
function isAuthenticated() {
    return localStorage.getItem('authToken') !== null;
}

// Fungsi untuk logout
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}

window.addEventListener('DOMContentLoaded', event => {
    const path = window.location.pathname;
    
    // Autentikasi check
    if (path.includes('index.html') || path === '/') {
        // Jika di halaman login dan sudah terautentikasi, redirect ke dashboard
        if (isAuthenticated()) {
            window.location.replace('dashboard.html');
            return;
        }
    } else {
        // Jika di halaman lain dan tidak terautentikasi, redirect ke login
        if (!isAuthenticated()) {
            window.location.replace('index.html');
            return;
        }
    }

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
            document.body.classList.toggle('sb-sidenav-toggled');
        }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

    // Setup logout
    const logoutLinks = document.querySelectorAll('a[href="index.html"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });

    // Update username di sidebar
    const loggedInAs = document.querySelector('.sb-sidenav-footer .small');
    if (loggedInAs) {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            loggedInAs.textContent = `Logged in as: ${userEmail}`;
        }
    }
});