// =====================================
// PCSHS Frontend Authentication Client
// Connects to Express/Node.js Backend
// =====================================

const API_BASE_URL = 'http://localhost:5000/api'; // Change this to your production URL when deployed

const Auth = {
    // Get stored token
    getToken() {
        return localStorage.getItem('pcshs_token');
    },

    // Store token
    setToken(token) {
        localStorage.setItem('pcshs_token', token);
    },

    // Remove token
    removeToken() {
        localStorage.removeItem('pcshs_token');
        localStorage.removeItem('pcshs_user');
    },

    // Get stored user
    getUser() {
        const userJson = localStorage.getItem('pcshs_user');
        return userJson ? JSON.parse(userJson) : null;
    },

    // Store user
    setUser(user) {
        localStorage.setItem('pcshs_user', JSON.stringify(user));
    },

    // Check if logged in
    isLoggedIn() {
        return this.getToken() !== null;
    },

    // Check if user is admin
    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    },

    // Login
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                this.setToken(data.token);
                this.setUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    },

    // Logout
    logout() {
        this.removeToken();
        window.location.href = 'index.html';
    },

    // Get current user from server
    async getCurrentUser() {
        try {
            const token = this.getToken();
            if (!token) return null;

            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                this.setUser(data.user);
                return data.user;
            } else {
                this.removeToken();
                return null;
            }
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    },

    // Require authentication (redirect to login if not authenticated)
    async requireAuth() {
        const user = await this.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Require admin (redirect if not admin)
    async requireAdmin() {
        const user = await this.getCurrentUser();
        if (!user || user.role !== 'admin') {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },

    // Update UI based on auth status
    updateUI() {
        const signupLink = document.querySelector('.signup-link');
        const mobileSignupLink = document.querySelector('.mobile-nav-link[href="signup.html"]');
        
        if (this.isLoggedIn()) {
            const user = this.getUser();
            
            // Update header link
            if (signupLink) {
                signupLink.textContent = user.fullName || user.email;
                signupLink.href = 'javascript:void(0)';
                signupLink.onclick = () => this.showUserMenu();
            }
            
            // Update mobile link
            if (mobileSignupLink) {
                mobileSignupLink.textContent = user.fullName || user.email;
                mobileSignupLink.href = 'javascript:void(0)';
                mobileSignupLink.onclick = () => this.showUserMenu();
            }
        } else {
            // Show login link
            if (signupLink) {
                signupLink.textContent = 'Log In';
                signupLink.href = 'login.html';
            }
            
            if (mobileSignupLink) {
                mobileSignupLink.textContent = 'Log In';
                mobileSignupLink.href = 'login.html';
            }
        }
    },

    // Show user menu dropdown
    showUserMenu() {
        // Remove existing menu if present
        const existingMenu = document.querySelector('.user-menu-dropdown');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const user = this.getUser();
        const menu = document.createElement('div');
        menu.className = 'user-menu-dropdown';
        menu.innerHTML = `
            <div class="user-menu-header">
                <strong>${user.fullName || user.email}</strong>
                <small>${user.role}</small>
            </div>
            <div class="user-menu-items">
                ${user.role === 'admin' ? '<a href="admin.html" class="user-menu-item">Admin Panel</a>' : ''}
                <a href="settings.html" class="user-menu-item">Settings</a>
                <a href="#" class="user-menu-item" onclick="Auth.logout(); return false;">Logout</a>
            </div>
        `;

        document.body.appendChild(menu);

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateUI();
});