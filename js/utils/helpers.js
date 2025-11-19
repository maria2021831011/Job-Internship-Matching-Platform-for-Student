
class Helpers {
    //DOM manipulation helpers
    static createElement(tag, classes = [], attributes = {}) {
        const element = document.createElement(tag);
        
        if (classes.length > 0) {
            element.classList.add(...classes);
        }
        
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });
        
        return element;
    }
    static showElement(element) {
        if (element) element.style.display = '';
    }
    static hideElement(element) {
        if (element) element.style.display = 'none';
    }
    static toggleElement(element) {
        if (element) {
            element.style.display = element.style.display === 'none' ? '' : 'none';
        }
    }

    //Date 
    static formatDate(date, format = 'medium') {
        const dateObj = new Date(date);
        const options = {
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            medium: { year: 'numeric', month: 'long', day: 'numeric' },
            long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        };

        return dateObj.toLocaleDateString('en-US', options[format] || options.medium);
    }
    static formatRelativeTime(date) {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }
    static isDateInPast(date) {
        return new Date(date) < new Date();
    }

    static isDateInFuture(date) {
        return new Date(date) > new Date();
    }

    //String 
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    static truncate(str, length = 50) {
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    }

    static sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    //Number 
    static formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }

    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    //Storage helpers
    static setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }
    static getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }
    static removeStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    // URL helpers
    static getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
    static setQueryParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    }
    static removeQueryParam(param) {
        const url = new URL(window.location);
        url.searchParams.delete(param);
        window.history.pushState({}, '', url);
    }
    //Event helpers
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    //Notification 
    static showToast(message, type = 'info', duration = 5000) {
        const toast = this.createElement('div', ['toast', `toast-${type}`]);
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${this.sanitizeHTML(message)}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;

        //Add style if not added
        if (!document.querySelector('#toast-styles')) {
            const styles = this.createElement('style', [], { id: 'toast-styles' });
            styles.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    max-width: 400px;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                }
                .toast.show {
                    transform: translateX(0);
                }
                .toast-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                }
                .toast-message {
                    flex: 1;
                    margin-right: 12px;
                }
                .toast-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #666;
                }
                .toast-info { border-left: 4px solid #3498db; }
                .toast-success { border-left: 4px solid #2ecc71; }
                .toast-warning { border-left: 4px solid #f39c12; }
                .toast-error { border-left: 4px solid #e74c3c; }
            `;
            document.head.appendChild(styles);
        }
        document.body.appendChild(toast);
        //Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        //Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.hideToast(toast);
        });

        //Auto hide
        if (duration > 0) {
            setTimeout(() => this.hideToast(toast), duration);
        }

        return toast;
    }

    static hideToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
    // Loading state
    static showLoading(element) {
        if (!element) return;
        const loading = this.createElement('div', ['loading-overlay']);
        loading.innerHTML = `
            <div class="loading-spinner"></div>
        `;

        //Add styles if not already added
        if (!document.querySelector('#loading-styles')) {
            const styles = this.createElement('style', [], { id: 'loading-styles' });
            styles.textContent = `
                .loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255,255,255,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(styles);
        }

        element.style.position = 'relative';
        element.appendChild(loading);
    }
    static hideLoading(element) {
        if (!element) return;
        const loading = element.querySelector('.loading-overlay');
        if (loading) {
            loading.remove();
        }
    }

    //Form helpers
    static serializeForm(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }
        return data;
    }
    static resetForm(form) {
        form.reset();
        form.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        form.querySelectorAll('.error-message').forEach(error => {
            error.remove();
        });
    }
    static async handleApiResponse(promise) {
        try {
            const response = await promise;
            return { data: response, error: null };
        } catch (error) {
            console.error('API Error:', error);
            return { data: null, error: error.message || 'An error occurred' };
        }
    }
    //Feature detection
    static supportsLocalStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    static supportsSessionStorage() {
        try {
            const test = 'test';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    static measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }
}
//Initialize helpers
window.Helpers = Helpers;