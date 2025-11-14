//Validation utilities for CareerHub
class Validation {
    static patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^\+?[\d\s\-\(\)]{10,}$/,
        url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    };

    static messages = {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        phone: 'Please enter a valid phone number',
        url: 'Please enter a valid URL',
        password: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
        minLength: 'Must be at least {min} characters',
        maxLength: 'Must be no more than {max} characters',
        match: 'Fields do not match'
    };

    static validateField(field, value, rules = {}) {
        const errors = [];

        //Required validation
        if (rules.required && (!value || value.trim() === '')) {
            errors.push(this.messages.required);
            return errors;
        }

        if (!value || value.trim() === '') {
            return errors; /*Skip other validations if empty and not required*/
        }

        //Type 
        if (rules.email && !this.patterns.email.test(value)) {
            errors.push(this.messages.email);
        }

        if (rules.phone && !this.patterns.phone.test(value.replace(/\s/g, ''))) {
            errors.push(this.messages.phone);
        }

        if (rules.url && !this.patterns.url.test(value)) {
            errors.push(this.messages.url);
        }

        if (rules.password && !this.patterns.password.test(value)) {
            errors.push(this.messages.password);
        }

        //Length 
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(this.messages.minLength.replace('{min}', rules.minLength));
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(this.messages.maxLength.replace('{max}', rules.maxLength));
        }

        //Custom 
        if (rules.custom && typeof rules.custom === 'function') {
            const customError = rules.custom(value);
            if (customError) {
                errors.push(customError);
            }
        }
        return errors;
    }

    static validateForm(formData, validationRules) {
        const errors = {};
        let isValid = true;

        Object.keys(validationRules).forEach(fieldName => {
            const value = formData[fieldName];
            const rules = validationRules[fieldName];
            const fieldErrors = this.validateField(fieldName, value, rules);

            if (fieldErrors.length > 0) {
                errors[fieldName] = fieldErrors;
                isValid = false;
            }
        });
        return { isValid, errors };
    }
    static matchFields(value1, value2, fieldName = 'Fields') {
        if (value1 !== value2) {
            return [`${fieldName} do not match`];
        }
        return [];
    }

    //Specific validation rules for different forms
    static getLoginRules() {
        return {
            email: { required: true, email: true },
            password: { required: true }
        };
    }

    static getRegistrationRules() {
        return {
            firstName: { required: true, minLength: 2 },
            lastName: { required: true, minLength: 2 },
            email: { required: true, email: true },
            password: { required: true, password: true },
            confirmPassword: { required: true },
            userType: { required: true }
        };
    }
    static getApplicationRules() {
        return {
            jobTitle: { required: true, minLength: 3 },
            companyName: { required: true, minLength: 2 },
            applicationDate: { required: true },
            applicationStatus: { required: true }
        };
    }

    static getProfileRules() {
        return {
            firstName: { required: true, minLength: 2 },
            lastName: { required: true, minLength: 2 },
            email: { required: true, email: true },
            phone: { phone: true },
            headline: { maxLength: 100 },
            summary: { maxLength: 1000 }
        };
    }
    // Helper to format field names for display
    static formatFieldName(fieldName) {
        return fieldName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/([A-Z])/g, ' $1')
            .trim();
    }
    //Real-time validation helper
    static setupRealTimeValidation(formElement, validationRules) {
        const inputs = formElement.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                const rules = validationRules[input.name];
                if (rules) {
                    const errors = this.validateField(input.name, input.value, rules);
                    this.displayFieldErrors(input, errors);
                }
            });
            input.addEventListener('input', () => {
                this.clearFieldErrors(input);
            });
        });
    }
    static displayFieldErrors(field, errors) {
        this.clearFieldErrors(field);

        if (errors.length > 0) {
            field.classList.add('error');

            let errorContainer = field.parentNode.querySelector('.error-message');
            if (!errorContainer) {
                errorContainer = document.createElement('div');
                errorContainer.className = 'error-message';
                field.parentNode.appendChild(errorContainer);
            }
            errorContainer.innerHTML = errors.map(error => 
                `<div class="error-item">${error}</div>`
            ).join('');
        } else {
            field.classList.remove('error');
        }
    }
    static clearFieldErrors(field) {
        field.classList.remove('error');
        
        const errorContainer = field.parentNode.querySelector('.error-message');
        if (errorContainer) {
            errorContainer.innerHTML = '';
        }
    }
    //Password strength calculator
    static calculatePasswordStrength(password) {
        if (!password) return 0;

        let strength = 0;
        
        //Length check
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 10;

        // Character variety
        if (/[a-z]/.test(password)) strength += 15;
        if (/[A-Z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

        return Math.min(strength, 100);
    }
    static getPasswordStrengthLabel(strength) {
        if (strength < 40) return { label: 'Weak', color: '#ef4444' };
        if (strength < 70) return { label: 'Fair', color: '#f59e0b' };
        if (strength < 90) return { label: 'Good', color: '#10b981' };
        return { label: 'Strong', color: '#059669' };
    }
}

//Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validation;
} else {
    window.Validation = Validation;
}