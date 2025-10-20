
class CTA {
    constructor() {
        this.init();
    }

    init() {
        this.addEventListeners();
        this.initParallaxEffect();
    }

    addEventListeners() {
   ns
        document.addEventListener('click', (e) => {
            if (e.target.closest('#ctaStudentBtn')) {
                this.trackCTA('student_signup');
            }
            
            if (e.target.closest('#ctaCompanyBtn')) {
                this.trackCTA('company_signup');
            }
        });
    }

    initParallaxEffect() {
        window.addEventListener('scroll', () => {
            const ctaSection = document.querySelector('.cta');
            if (ctaSection) {
                const scrolled = window.pageYOffset;
                const parallax = scrolled * -0.5;
                ctaSection.style.backgroundPositionY = `${parallax}px`;
            }
        });
    }

    trackCTA(action) {
       
        console.log(`CTA clicked: ${action}`);
        
        
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': 'CTA',
                'event_label': 'Main CTA Section'
            });
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new CTA();
});