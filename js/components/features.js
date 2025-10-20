
class Features {
    constructor() {
        this.featuresGrid = document.getElementById('featuresGrid');
        this.init();
    }

    init() {
        this.renderFeatures();
        this.addEventListeners();
    }

    renderFeatures() {
        this.featuresGrid.innerHTML = CONFIG.features.map(feature => `
            <div class="feature-card" id="${feature.id}">
                <div class="feature-icon" style="background: linear-gradient(135deg, ${feature.gradient[0]}, ${feature.gradient[1]});">
                    <i class="${feature.icon}"></i>
                </div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
                <div class="card-footer">
                    <a href="#" class="learn-more">Learn more <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `).join('');
    }

    addEventListeners() {
    
        this.featuresGrid.addEventListener('click', (e) => {
            if (e.target.closest('.learn-more')) {
                e.preventDefault();
                const card = e.target.closest('.feature-card');
                this.handleLearnMore(card.id);
            }
        });

        this.featuresGrid.addEventListener('mouseenter', (e) => {
            if (e.target.closest('.feature-card')) {
                const card = e.target.closest('.feature-card');
                this.enhanceCard(card);
            }
        }, true);

        this.featuresGrid.addEventListener('mouseleave', (e) => {
            if (e.target.closest('.feature-card')) {
                const card = e.target.closest('.feature-card');
                this.resetCard(card);
            }
        }, true);
    }

    enhanceCard(card) {
        card.style.transform = 'translateY(-10px)';
    }

    resetCard(card) {
        card.style.transform = 'translateY(0)';
    }

    handleLearnMore(featureId) {
       
        const feature = CONFIG.features.find(f => f.id === featureId);
        if (feature) {
            this.showFeatureModal(feature);
        }
    }

    showFeatureModal(feature) {
       
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="feature-icon" style="background: linear-gradient(135deg, ${feature.gradient[0]}, ${feature.gradient[1]}); margin: 0 auto 20px;">
                    <i class="${feature.icon}"></i>
                </div>
                <h2>${feature.title}</h2>
                <p>${feature.description}</p>
                <div class="feature-details">
                    <h4>Key Benefits:</h4>
                    <ul>
                        <li>Personalized matching algorithm</li>
                        <li>Real-time job recommendations</li>
                        <li>Skill-based opportunity matching</li>
                        <li>Schedule compatibility checking</li>
                    </ul>
                </div>
                <div class="modal-actions">
                    <a href="registration.html" class="btn btn-primary">Get Started</a>
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
    new Features();
});