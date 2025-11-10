
class Companies {
    constructor() {
        this.companiesContent = document.getElementById('companiesContent');
        this.init();
    }

    init() {
        this.renderContent();
        this.addEventListeners();
    }

    renderContent() {
        this.companiesContent.innerHTML = `
            <div class="companies-features">
                <div class="company-feature">
                    <div class="company-feature-icon">
                        <i class="fas fa-bullseye"></i>
                    </div>
                    <div class="company-feature-content">
                        <h4>Targeted Candidate Matching</h4>
                        <p>Our AI algorithm matches you with students whose skills, interests, and availability align with your requirements.</p>
                    </div>
                </div>
                
                <div class="company-feature">
                    <div class="company-feature-icon">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <div class="company-feature-content">
                        <h4>Pre-Vetted Talent Pool</h4>
                        <p>Access a curated pool of students who have been verified for skills, academic standing, and career readiness.</p>
                    </div>
                </div>
                
                <div class="company-feature">
                    <div class="company-feature-icon">
                        <i class="fas fa-tachometer-alt"></i>
                    </div>
                    <div class="company-feature-content">
                        <h4>Streamlined Hiring Process</h4>
                        <p>Manage applications, schedule interviews, and make offers through our integrated platform designed for efficiency.</p>
                    </div>
                </div>
                
                <div class="company-feature">
                    <div class="company-feature-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="company-feature-content">
                        <h4>Performance Analytics</h4>
                        <p>Track hiring metrics, candidate engagement, and conversion rates with our comprehensive analytics dashboard.</p>
                    </div>
                </div>
            </div>
            
            <div class="companies-visual">
                <div class="visual-element"></div>
                <div class="visual-element"></div>
                <div class="visual-element"></div>
                <div class="companies-visual-content">
                    <h3>Join 500+ Companies</h3>
                    <p>That trust CareerLaunch for their hiring needs</p>
                    <a href="registration.html?type=company" class="btn btn-primary btn-large">Post Your First Job</a>
                </div>
            </div>
        `;
    }

    addEventListeners() {
      
        this.companiesContent.addEventListener('click', (e) => {
            const feature = e.target.closest('.company-feature');
            if (feature) {
                this.showFeatureDetails(feature);
            }
        });

     
        const visual = this.companiesContent.querySelector('.companies-visual');
        if (visual) {
            visual.addEventListener('mouseenter', () => {
                this.animateVisualElements();
            });

            visual.addEventListener('mouseleave', () => {
                this.resetVisualElements();
            });
        }
    }

    animateVisualElements() {
        const elements = this.companiesContent.querySelectorAll('.visual-element');
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.style.transform = 'scale(1.1)';
            }, index * 100);
        });
    }

    resetVisualElements() {
        const elements = this.companiesContent.querySelectorAll('.visual-element');
        elements.forEach(element => {
            element.style.transform = 'scale(1)';
        });
    }

    showFeatureDetails(feature) {
        const title = feature.querySelector('h4').textContent;
        const description = feature.querySelector('p').textContent;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="company-feature-icon">
                    <i class="${feature.querySelector('i').className}"></i>
                </div>
                <h2>${title}</h2>
                <p>${description}</p>
                <div class="feature-benefits">
                    <h4>Key Benefits for Companies:</h4>
                    <ul>
                        <li>Reduce hiring time by up to 60%</li>
                        <li>Access to pre-screened candidates</li>
                        <li>AI-powered candidate matching</li>
                        <li>Streamlined interview scheduling</li>
                        <li>Detailed candidate analytics</li>
                    </ul>
                </div>
                <div class="modal-actions">
                    <a href="registration.html?type=company" class="btn btn-primary">Start Hiring</a>
                    <a href="#" class="btn btn-outline">Schedule Demo</a>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

       
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new Companies();
});