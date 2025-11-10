
class LoginPage {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.typeOptions = document.querySelectorAll('.type-option');
        this.demoAccounts = document.querySelectorAll('.demo-account');
        this.currentUserType = 'student';
        this.init();
    }

    init() {
        this.addEventListeners();
        this.checkRememberedUser();
        this.setupFormValidation();
    }

    addEventListeners() {

        this.typeOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.handleUserTypeChange(option);
            });
        });

       
        
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => {
                this.handleFormSubmission(e);
            });
        }

       
        
        this.demoAccounts.forEach(account => {
            account.addEventListener('click', () => {
                this.fillDemoCredentials(account);
            });
        });

      
        this.setupInputInteractions();
    }

    handleUserTypeChange(selectedOption) {
      
        this.typeOptions.forEach(option => option.classList.remove('active'));
        
      
        selectedOption.classList.add('active');
        
     
        this.currentUserType = selectedOption.dataset.type;
        
      
        this.updateFormForUserType();
        
        
        
        this.animateUserTypeChange(selectedOption);
    }

    updateFormForUserType() {
      
        const hiddenInput = this.loginForm.querySelector('input[name="user_type"]');
        if (!hiddenInput) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'user_type';
            input.value = this.currentUserType;
            this.loginForm.appendChild(input);
        } else {
            hiddenInput.value = this.currentUserType;
        }
    }

    animateUserTypeChange(selectedOption) {
      
        selectedOption.style.transform = 'scale(0.95)';
        setTimeout(() => {
            selectedOption.style.transform = 'scale(1)';
        }, 150);
    }

    handleFormSubmission(e) {
        e.preventDefault();
        
        const formData = new FormData(this.loginForm);
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('remember');
        
       
        if (!this.validateForm(email, password)) {
            return;
        }
     
        this.setLoadingState(true);
        
        
        const loginData = {
            email: email,
            password: password,
            user_type: this.currentUserType,
            remember: remember === 'on'
        };
        
      
        this.submitLogin(loginData);
    }

    validateForm(email, password) {
        let isValid = true;
        
        
        this.clearErrors();
        
      
        if (!email || !this.isValidEmail(email)) {
            this.showError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
       
        if (!password || password.length < 6) {
            this.showError('password', 'Password must be at least 6 characters long');
            isValid = false;
        }
        
        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const formGroup = field.closest('.form-group');
        
        formGroup.classList.add('error');
        
        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }

    clearErrors() {
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
            const errorElement = group.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
        });
    }

    setLoadingState(loading) {
        const submitBtn = this.loginForm.querySelector('button[type="submit"]');
        
        if (loading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    }

    submitLogin(loginData) {
    
        setTimeout(() => {
            this.setLoadingState(false);
            
          
            if (this.isValidDemoLogin(loginData)) {
                this.handleLoginSuccess(loginData);
            } else {
                this.handleLoginError('Invalid email or password');
            }
        }, 2000);
    }

    isValidDemoLogin(loginData) {
        const demoCredentials = {
            'student@demo.com': 'demo123',
            'company@demo.com': 'demo123'
        };
        
        return demoCredentials[loginData.email] === loginData.password;
    }

    handleLoginSuccess(loginData) {
        
        if (loginData.remember) {
            this.rememberUser(loginData.email, loginData.user_type);
        } else {
            this.forgetUser();
        }
        
     
        this.showNotification('Login successful! Redirecting...', 'success');
           setTimeout(() => {
            this.redirectToDashboard(loginData.user_type);
        }, 1500);
    }

    handleLoginError(message) {
        this.showNotification(message, 'error');
        
       
        this.shakeForm();
    }

    showNotification(message, type) {
       
        const existingNotification = document.querySelector('.auth-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `auth-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
      
        if (!document.querySelector('#auth-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'auth-notification-styles';
            styles.textContent = `
                .auth-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    border-left: 4px solid #06d6a0;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    z-index: 10000;
                    max-width: 400px;
                }
                .notification-error { border-left-color: #ef4444; }
                .auth-notification.show { transform: translateX(0); }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .notification-success .notification-content i { color: #06d6a0; }
                .notification-error .notification-content i { color: #ef4444; }
            `;
            document.head.appendChild(styles);
        }
        
        notification.classList.add(`notification-${type}`);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }

    shakeForm() {
        this.loginForm.style.transform = 'translateX(10px)';
        setTimeout(() => {
            this.loginForm.style.transform = 'translateX(-10px)';
            setTimeout(() => {
                this.loginForm.style.transform = 'translateX(0)';
            }, 100);
        }, 100);
    }

    fillDemoCredentials(account) {
        const email = account.dataset.email;
        const password = account.dataset.password;
        const userType = email.includes('student') ? 'student' : 'company';
        
      
        document.getElementById('email').value = email;
        document.getElementById('password').value = password;
        
       
        this.typeOptions.forEach(option => option.classList.remove('active'));
        document.querySelector(`.type-option[data-type="${userType}"]`).classList.add('active');
        this.currentUserType = userType;
        
       
        account.style.background = 'rgba(37, 99, 235, 0.2)';
        setTimeout(() => {
            account.style.background = '';
        }, 1000);
        
        this.showNotification('Demo credentials filled!', 'success');
    }

    setupInputInteractions() {
        const inputs = this.loginForm.querySelectorAll('input');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
            });
            
            input.addEventListener('input', () => {
                this.clearErrors();
            });
        });
    }

    rememberUser(email, userType) {
        localStorage.setItem('remembered_email', email);
        localStorage.setItem('remembered_user_type', userType);
    }

    forgetUser() {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_user_type');
    }

    checkRememberedUser() {
        const rememberedEmail = localStorage.getItem('remembered_email');
        const rememberedUserType = localStorage.getItem('remembered_user_type');
        
        if (rememberedEmail && rememberedUserType) {
            document.getElementById('email').value = rememberedEmail;
            document.getElementById('remember').checked = true;
            
            this.typeOptions.forEach(option => option.classList.remove('active'));
            document.querySelector(`.type-option[data-type="${rememberedUserType}"]`).classList.add('active');
            this.currentUserType = rememberedUserType;
        }
    }

    setupFormValidation() {
      
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        emailInput.addEventListener('blur', () => {
            if (emailInput.value && !this.isValidEmail(emailInput.value)) {
                this.showError('email', 'Please enter a valid email address');
            }
        });
        
        passwordInput.addEventListener('blur', () => {
            if (passwordInput.value && passwordInput.value.length < 6) {
                this.showError('password', 'Password must be at least 6 characters');
            }
        });
    }

    redirectToDashboard(userType) {
        const dashboards = {
            student: '../students/dashboard.html',
            company: '../companies/dashboard.html'
        };
        
        window.location.href = dashboards[userType] || '../index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
});