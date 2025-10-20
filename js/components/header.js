class Header {
    constructor() {
        this.header = document.getElementById('header');
        this.init();
    }
    init() {
        this.renderHeader();
        this.addEventListeners();
    }
    renderHeader() {
        this.header.innerHTML = `
            <header>
                <div class="container">
                    <nav class="navbar">
                        <a href="index.html" class="logo">
                            <div class="logo-icon">CL</div>
                            <div class="logo-text">Career<span>Launch</span></div>
                        </a>
                        
                        <button class="mobile-menu-btn" id="mobileMenuBtn">
                            <i class="fas fa-bars"></i>
                        </button>
                        
                        <ul class="nav-menu" id="navMenu">
                            <li><a href="#features" class="nav-link">Features</a></li>
                            <li><a href="#how-it-works" class="nav-link">How It Works</a></li>
                            <li><a href="#browse-jobs" class="nav-link">Browse Jobs</a></li>
                            <li><a href="#for-companies" class="nav-link">For Companies</a></li>
                            <li><a href="#success-stories" class="nav-link">Success Stories</a></li>
                        </ul>

                        <div class="nav-actions">
                            <a href="login.html" class="btn btn-outline" id="loginBtn">Login</a>
                            <a href="registration.html" class="btn btn-primary" id="signupBtn">Sign Up Free</a>
                        </div>
                    </nav>
                </div>
            </header>
        `;
    }

    addEventListeners() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.getElementById('navMenu');
        const navActions = document.querySelector('.nav-actions');
        if (window.innerWidth <= 992) navMenu.appendChild(navActions);

        window.addEventListener('resize', () => {
            if (window.innerWidth <= 992) {
                if (!navMenu.contains(navActions)) navMenu.appendChild(navActions);
            } else {
                document.querySelector('.navbar').appendChild(navActions);
                navMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });

        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuBtn.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    navMenu.classList.remove('active');
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => { new Header(); });