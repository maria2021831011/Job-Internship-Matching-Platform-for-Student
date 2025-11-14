//Authentication functionality
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormHandlers();
        this.checkExistingAuth();
    }
    setupFormHandlers() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }

        //Real-time validation
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
                
                input.addEventListener('input', () => {
                    this.clearFieldError(input);
                });
            });
        });
    }
   async handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        
        if (this.validateForm(event.target)) {
            try {
                const result = await this.performLogin(data);
                
                if (result.success) {
                    this.storeAuthData(result.user, result.token);
                    this.redirectUser(result.user.type);
                } else {
                    this.showFormError(event.target, result.message);
                }
            } catch (error) {
                this.showFormError(event.target, 'Login failed. Please try again.');
            }
        }
    }
    async handleRegister(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        
        if (this.validateForm(event.target)) {
            try {
                const result = await this.performRegistration(data);
                
                if (result.success) {
                    this.storeAuthData(result.user, result.token);
                    this.redirectUser(result.user.type);
                } else {
                    this.showFormError(event.target, result.message);
                }
            } catch (error) {
                this.showFormError(event.target, 'Registration failed. Please try again.');
            }
        }
    }
    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        //Additional form-specific validation
        if (form.id === 'registerForm') {
            const password = form.querySelector('#password');
            const confirmPassword = form.querySelector('#confirmPassword');
            
            if (password.value !== confirmPassword.value) {
                this.showFieldError(confirmPassword, 'Passwords do not match');
                isValid = false;
            }
        }

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name || field.id;
        
        //Clear previous error
        this.clearFieldError(field);
        
        //Required field validation
        if (field.required && !value) {
            this.showFieldError(field, `${this.formatFieldName(fieldName)} is required`);
            return false;
        }
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(field, 'Please enter a valid email address');
                return false;
            }
        }   
        //Password validation
        if (field.type === 'password' && value && field.id === 'password') {
            if (value.length < 8) {
                this.showFieldError(field, 'Password must be at least 8 characters long');
                return false;
            }
        }
        
        return true;
    }
    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }

    clearFieldError(field) {
        field.classList.remove('error');
        
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    showFormError(form, message) {
        // Create or update form-level error message
        let errorElement = form.querySelector('.form-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            form.prepend(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--error);
            background: #fef2f2;
            border: 1px solid var(--error);
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 1rem;
            text-align: center;
        `;
    }

    formatFieldName(fieldName) {
        return fieldName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/([A-Z])/g, ' $1')
            .trim();
    }

    async performLogin(credentials) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock authentication - in real app,would be an API call
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const user = users.find(u => 
                    u.email === credentials.email && 
                    u.password === credentials.password
                );
                
                if (user) {
                    resolve({
                        success: true,
                        user: { id: user.id, email: user.email, type: user.type, name: user.firstName + ' ' + user.lastName },
                        token: 'mock-jwt-token-' + Date.now()
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Invalid email or password'
                    });
                }
            }, 1000);
        });
    }

    async performRegistration(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                
                //Check if user already exists
                if (users.find(u => u.email === userData.email)) {
                    resolve({
                        success: false,
                        message: 'User with this email already exists'
                    });
                    return;
                }
                
                //Create new user
                const newUser = {
                    id: Date.now().toString(),
                    ...userData,
                    createdAt: new Date().toISOString()
                };
                
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                
                resolve({
                    success: true,
                    user: { 
                        id: newUser.id, 
                        email: newUser.email, 
                        type: newUser.userType, 
                        name: newUser.firstName + ' ' + newUser.lastName 
                    },
                    token: 'mock-jwt-token-' + Date.now()
                });
            }, 1000);
        });
    }

    storeAuthData(user, token) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('authToken', token);
    }

    redirectUser(userType) {
        const redirectPath = userType === 'company' 
            ? '/pages/profile/profile_company.html'
            : '/pages/profile/profile_student.html';
        
        window.location.href = redirectPath;
    }

    checkExistingAuth() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const authToken = localStorage.getItem('authToken');
        
        if (currentUser && authToken) {
            this.redirectUser(currentUser.type);
        }
    }
}

// Initialize auth manager
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});