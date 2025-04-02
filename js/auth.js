// Authentication handling
class Auth {
    constructor() {
        this.isLoggedIn = false;
        this.user = null;
        this.init();
    }

    init() {
        // Check for existing session
        const token = localStorage.getItem('authToken');
        if (token) {
            this.validateToken(token);
        }

        // Setup login form handler
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Setup signup form handler
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        console.log('Login form submitted');
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // For demo/school project: accept any valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        if (!password || password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }

        try {
            // For demo: create a simple token
            const token = btoa(email + ':' + Date.now());
            
            // Store user info
            this.setSession(token, { email });
            this.showSuccess('Login successful! Redirecting to dashboard...');
            
            // Redirect after a short delay to show the success message
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed. Please try again.');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        if (!password || password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        try {
            // For demo: store the email in localStorage
            localStorage.setItem('registeredEmail', email);
            
            this.showSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } catch (error) {
            console.error('Signup error:', error);
            this.showError('Signup failed. Please try again.');
        }
    }

    setSession(token, user) {
        console.log('Setting session with token:', token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', user.email);
        this.isLoggedIn = true;
        this.user = user;
        this.updateUI();
    }

    validateToken(token) {
        const userEmail = localStorage.getItem('userEmail');
        if (token && userEmail) {
            this.isLoggedIn = true;
            this.user = { email: userEmail };
            this.updateUI();
            
            // If on login page and already logged in, redirect to dashboard
            if (window.location.pathname.includes('login.html')) {
                window.location.href = 'dashboard.html';
            }
        }
    }

    updateUI() {
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.querySelector('.user-menu');
        
        if (this.isLoggedIn) {
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                const userEmail = document.getElementById('userEmail');
                if (userEmail) userEmail.textContent = this.user.email;
            }
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    showError(message) {
        console.error('Error:', message);
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        console.log('Success:', message);
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notificationDiv = document.createElement('div');
        notificationDiv.className = `notification ${type}`;
        notificationDiv.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                          type === 'error' ? 'fa-times-circle' : 
                          'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Position the notification
        notificationDiv.style.position = 'fixed';
        notificationDiv.style.top = '20px';
        notificationDiv.style.left = '50%';
        notificationDiv.style.transform = 'translateX(-50%)';
        notificationDiv.style.padding = '15px 25px';
        notificationDiv.style.borderRadius = '5px';
        notificationDiv.style.zIndex = '1000';
        notificationDiv.style.backgroundColor = type === 'error' ? '#ff4444' : '#00b894';
        notificationDiv.style.color = 'white';
        
        document.body.appendChild(notificationDiv);
        
        // Add fade-in animation
        notificationDiv.style.opacity = '0';
        notificationDiv.style.transition = 'opacity 0.3s ease-in-out';
        setTimeout(() => notificationDiv.style.opacity = '1', 10);
        
        // Remove after delay
        setTimeout(() => {
            notificationDiv.style.opacity = '0';
            setTimeout(() => notificationDiv.remove(), 300);
        }, 3000);
    }

    logout() {
        console.log('Logging out...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        this.isLoggedIn = false;
        this.user = null;
        this.updateUI();
        window.location.href = 'index.html';
    }
}

// Initialize authentication when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing auth system...');
    window.auth = new Auth();
});
