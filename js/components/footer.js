class Footer {
            constructor() {
                this.footer = document.getElementById('footer');
                this.init();
            }

            init() {
                this.renderFooter();
                this.setupEventListeners();
            }

            renderFooter() {
                this.footer.innerHTML = `
                    <footer>
                        <div class="container">
                            <div class="footer-content">
                                <div class="footer-column">
                                    <h3>CareerLaunch</h3>
                                    <p>Connecting students with the right internships and part-time jobs through intelligent matching technology.</p>
                                    <div class="social-links">
                                        <a href="https://facebook.com/careerlaunch" target="_blank" aria-label="Facebook">
                                            <i class="fab fa-facebook-f"></i>
                                        </a>
                                        <a href="https://twitter.com/careerlaunch" target="_blank" aria-label="Twitter">
                                            <i class="fab fa-twitter"></i>
                                        </a>
                                        <a href="https://linkedin.com/company/careerlaunch" target="_blank" aria-label="LinkedIn">
                                            <i class="fab fa-linkedin-in"></i>
                                        </a>
                                        <a href="https://instagram.com/careerlaunch" target="_blank" aria-label="Instagram">
                                            <i class="fab fa-instagram"></i>
                                        </a>
                                    </div>
                                </div>
                                
                                <div class="footer-column">
                                    <h3>For Students</h3>
                                    <ul class="footer-links">
                                        <li><a href="#browse-jobs">
                                            <i class="fas fa-chevron-right"></i> Find Internships
                                        </a></li>
                                        <li><a href="#browse-jobs">
                                            <i class="fas fa-chevron-right"></i> Part-Time Jobs
                                        </a></li>
                                        <li><a href="resources.html">
                                            <i class="fas fa-chevron-right"></i> Career Resources
                                        </a></li>
                                        <li><a href="#success-stories">
                                            <i class="fas fa-chevron-right"></i> Success Stories
                                        </a></li>
                                    </ul>
                                </div>
                                
                                <div class="footer-column">
                                    <h3>For Companies</h3>
                                    <ul class="footer-links">
                                        <li><a href="#for-companies">
                                            <i class="fas fa-chevron-right"></i> Post a Job
                                        </a></li>
                                        <li><a href="#for-companies">
                                            <i class="fas fa-chevron-right"></i> Browse Candidates
                                        </a></li>
                                        <li><a href="pricing.html">
                                            <i class="fas fa-chevron-right"></i> Pricing Plans
                                        </a></li>
                                        <li><a href="#success-stories">
                                            <i class="fas fa-chevron-right"></i> Success Stories
                                        </a></li>
                                    </ul>
                                </div>
                                
                                <div class="footer-column">
                                    <h3>Support</h3>
                                    <ul class="footer-links">
                                        <li><a href="#" class="support-link" data-modal="helpModal">
                                            <i class="fas fa-chevron-right"></i> Help Center
                                        </a></li>
                                        <li><a href="#" class="support-link" data-modal="contactModal">
                                            <i class="fas fa-chevron-right"></i> Contact Us
                                        </a></li>
                                        <li><a href="#" class="support-link" data-modal="privacyModal">
                                            <i class="fas fa-chevron-right"></i> Privacy Policy
                                        </a></li>
                                        <li><a href="#" class="support-link" data-modal="termsModal">
                                            <i class="fas fa-chevron-right"></i> Terms of Service
                                        </a></li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="footer-bottom">
                                <p>&copy; 2025 CareerLaunch. All rights reserved. | Building the future of career connections</p>
                                <div class="footer-legal-links">
                                    <a href="#" class="legal-link support-link" data-modal="privacyModal">Privacy</a>
                                    <span class="separator">|</span>
                                    <a href="#" class="legal-link support-link" data-modal="termsModal">Terms</a>
                                    <span class="separator">|</span>
                                    <a href="#" class="legal-link support-link" data-modal="contactModal">Contact</a>
                                </div>
                            </div>
                        </div>
                    </footer>
                `;
            }

            setupEventListeners() {
              
                this.footer.addEventListener('click', (e) => {
                    const supportLink = e.target.closest('.support-link');
                    if (supportLink) {
                        e.preventDefault();
                        const modalId = supportLink.getAttribute('data-modal');
                        this.openModal(modalId);
                    }

                  
                    const anchorLink = e.target.closest('a[href^="#"]');
                    if (anchorLink && !anchorLink.classList.contains('support-link')) {
                        e.preventDefault();
                        this.handleAnchorClick(anchorLink.getAttribute('href'));
                    }
                });

               
                document.querySelectorAll('.modal-close, .close-modal').forEach(btn => {
                    btn.addEventListener('click', () => {
                        this.closeModals();
                    });
                });

             
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            this.closeModals();
                        }
                    });
                });
            }

            openModal(modalId) {
                this.closeModals();
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                }
            }

            closeModals() {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('show');
                });
                document.body.style.overflow = '';
            }

            handleAnchorClick(href) {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            const footer = new Footer();
            window.careerLaunchFooter = footer;
        });