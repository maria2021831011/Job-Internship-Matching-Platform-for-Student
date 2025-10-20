
class HowItWorks {
    constructor() {
        this.stepsContainer = document.getElementById('stepsContainer');
        this.init();
    }

    init() {
        this.renderSteps();
        this.addEventListeners();
    }

    renderSteps() {
        this.stepsContainer.innerHTML = CONFIG.steps.map(step => `
            <div class="step" id="${step.id}">
                <div class="step-number">${step.number}</div>
                <div class="step-content">
                    <h3>${step.title}</h3>
                    <p>${step.description}</p>
                </div>
            </div>
        `).join('');
    }

    addEventListeners() {
   
        this.stepsContainer.addEventListener('click', (e) => {
            const step = e.target.closest('.step');
            if (step) {
                this.showStepDetails(step.id);
            }
        });

       
        this.stepsContainer.addEventListener('mouseenter', (e) => {
            const step = e.target.closest('.step');
            if (step) {
                this.highlightStep(step);
            }
        }, true);

        this.stepsContainer.addEventListener('mouseleave', (e) => {
            const step = e.target.closest('.step');
            if (step) {
                this.unhighlightStep(step);
            }
        }, true);
    }

    highlightStep(step) {
        step.style.transform = 'scale(1.05)';
    }

    unhighlightStep(step) {
        step.style.transform = 'scale(1)';
    }

    showStepDetails(stepId) {
        const step = CONFIG.steps.find(s => s.id === stepId);
        if (step) {
           
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <div class="step-number">${step.number}</div>
                    <h2>${step.title}</h2>
                    <p>${step.description}</p>
                    <div class="step-details">
                        <h4>What you'll do:</h4>
                        <ul>
                            <li>Complete your profile with detailed information</li>
                            <li>Upload your resume and portfolio</li>
                            <li>Set your availability and preferences</li>
                            <li>Specify your career interests and goals</li>
                        </ul>
                        <h4>Time required: 10-15 minutes</h4>
                    </div>
                    <div class="modal-actions">
                        <a href="registration.html" class="btn btn-primary">Start Now</a>
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
}


document.addEventListener('DOMContentLoaded', () => {
    new HowItWorks();
});