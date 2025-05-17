// dashboard.js

class Dashboard {
    constructor() {
        this.userEmail = localStorage.getItem('userEmail');
        this.userName = localStorage.getItem('userName');
        this.authToken = localStorage.getItem('authToken');
        
        // Initialize elements
        this.userEmailElement = document.getElementById('userEmail');
        this.userNameElement = document.getElementById('userName');
        this.userNameFooterElement = document.getElementById('userNameFooter');
        this.logoutLink = document.getElementById('logoutLink');
        this.confirmLogoutBtn = document.getElementById('confirmLogout');
        
        // Initialize Bootstrap Modal
        this.logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
        
        this.init();
    }

    init() {
        // Check authentication
        this.checkAuth();
        
        // Display user information
        this.displayUserInfo();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    checkAuth() {
        if (!this.authToken) {
            window.location.href = 'index.html';
            return;
        }
    }

    displayUserInfo() {
        // Display email if available
        if (this.userEmail && this.userEmailElement) {
            this.userEmailElement.textContent = this.userEmail;
        }

        // Display name if available
        if (this.userName) {
            if (this.userNameElement) {
                this.userNameElement.textContent = this.userName;
            }
            if (this.userNameFooterElement) {
                this.userNameFooterElement.textContent = this.userName;
            }
        }
    }

    setupEventListeners() {
        // Setup logout handler
        if (this.logoutLink) {
            this.logoutLink.addEventListener('click', (e) => {
                e.preventDefault(); // Penting: mencegah default action
                this.showLogoutConfirmation();
            });
        }

        // Setup confirm logout button handler
        if (this.confirmLogoutBtn) {
            this.confirmLogoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Setup sidebar toggle
        const sidebarToggle = document.body.querySelector('#sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', (e) => {
                e.preventDefault();
                document.body.classList.toggle('sb-sidenav-toggled');
                localStorage.setItem('sb|sidebar-toggle', 
                    document.body.classList.contains('sb-sidenav-toggled')
                );
            });
        }

        // Restore sidebar toggle state if saved
        if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
            document.body.classList.add('sb-sidenav-toggled');
        }
    }

    showLogoutConfirmation() {
        this.logoutModal.show();
    }

    handleLogout() {
        // Hide modal
        this.logoutModal.hide();
        
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        
        // Redirect to login page
        window.location.href = 'index.html';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});