
class CareerHub {
    constructor() {
        this.init();
    }
    init() {
        this.loadComponents();
        this.setupEventListeners();
        this.initializeApp();
    }

    loadComponents() {
        // Load header and footer components
        this.loadComponent('header', '/pages/components/header.html');
        this.loadComponent('footer', '/pages/components/footer.html');
    }
    async loadComponent(elementId, url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Component not found');
            
            const html = await response.text();
            document.getElementById(elementId).innerHTML = html;
            
            // Re-initialize event listeners for dynamically loaded content
            this.setupComponentEventListeners();
        } catch (error) {
            console.error(`Error loading component ${url}:`, error);
        }
    }

    setupEventListeners() {
        // Global event listeners
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        
        // Navigation
        this.setupNavigation();
    }
    setupComponentEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
    }

    setupNavigation() {
        // Update active navigation link
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    }

    handleGlobalClick(event) {
        // Handle global click events
        const target = event.target;
        
        // Close mobile menu when clicking outside
        if (window.innerWidth <= 768) {
            const navLinks = document.querySelector('.nav-links');
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            
            if (navLinks && mobileMenuBtn && 
                !navLinks.contains(target) && 
                !mobileMenuBtn.contains(target) &&
                navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        }
    }

    initializeApp() {
        //Initialize application state
        this.currentUser = this.getCurrentUser();
        this.updateUIBasedOnAuth();
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    updateUIBasedOnAuth() {
        const authButtons = document.querySelector('.auth-buttons');
        if (!authButtons) return;

        if (this.currentUser) {
            authButtons.innerHTML = `
                <a href="/pages/profile/profile_${this.currentUser.type}.html" class="btn btn-secondary">Dashboard</a>
                <button class="btn btn-primary" id="logoutBtn">Logout</button>
            `;
            
            document.getElementById('logoutBtn').addEventListener('click', this.logout.bind(this));
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
    }

    //Utility methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.careerHub = new CareerHub();
});