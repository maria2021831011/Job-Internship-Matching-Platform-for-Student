class Hero {
    constructor() {
        this.init();
    }

    init() {
        this.initStatsAnimation();
    }

    initStatsAnimation() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateNumbers();
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(document.querySelector('.hero-stats'));
    }

    animateNumbers() {
        const stats = [
            { element: document.querySelector('#stat1 .stat-number'), target: 150, duration: 2000 },
            { element: document.querySelector('#stat2 .stat-number'), target: 35, duration: 2000 },
            { element: document.querySelector('#stat3 .stat-number'), target: 85, duration: 2000 }
        ];

        stats.forEach(stat => {
            if(stat.element) this.animateNumber(stat.element, stat.target, stat.duration);
        });
    }

    animateNumber(element, target, duration) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if(current >= target){ current = target; clearInterval(timer); }
            element.textContent = Math.floor(current) + (target === 85 ? '%' : '+');
        },16);
    }
}

document.addEventListener('DOMContentLoaded', () => new Hero());
