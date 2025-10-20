
class Stories {
    constructor() {
        this.storiesContainer = document.getElementById('storiesContainer');
        this.init();
    }

    init() {
        this.renderStories();
        this.addEventListeners();
    }

    renderStories() {
        this.storiesContainer.innerHTML = `
            <div class="stories-content">
                <div class="story-card">
                    <div class="story-header">
                        <div class="story-avatar">SJ</div>
                        <div class="story-info">
                            <h4>Sarah Johnson</h4>
                            <p>Software Engineer at TechCorp</p>
                        </div>
                    </div>
                    <div class="story-quote">
                        "CareerLaunch helped me find my dream internship that turned into a full-time offer. The matching algorithm really understood my skills and career goals. I went from applying to dozens of companies to getting multiple offers through targeted matches."
                    </div>
                </div>
                
                <div class="story-card">
                    <div class="story-header">
                        <div class="story-avatar">MR</div>
                        <div class="story-info">
                            <h4>Michael Rodriguez</h4>
                            <p>Hiring Manager at DataCorp</p>
                        </div>
                    </div>
                    <div class="story-quote">
                        "We've hired 5 amazing interns through CareerLaunch in the past year. The quality of candidates is consistently high and the platform saves us so much time in the screening process. The match percentage feature is incredibly accurate."
                    </div>
                </div>
            </div>
            
            <div class="stories-visual">
                <div class="floating-testimonial">
                    <div class="story-header">
                        <div class="story-avatar">EC</div>
                        <div class="story-info">
                            <h4>Emily Chen</h4>
                            <p>UX Designer</p>
                        </div>
                    </div>
                    <p>"Landed 3 interviews in my first week!"</p>
                </div>
                
                <div class="floating-testimonial">
                    <div class="story-header">
                        <div class="story-avatar">AJ</div>
                        <div class="story-info">
                            <h4>Alex Johnson</h4>
                            <p>Startup Founder</p>
                        </div>
                    </div>
                    <p>"Found our perfect intern in 48 hours."</p>
                </div>
                
                <div class="floating-testimonial">
                    <div class="story-header">
                        <div class="story-avatar">RK</div>
                        <div class="story-info">
                            <h4>Rebecca Kim</h4>
                            <p>Marketing Intern</p>
                        </div>
                    </div>
                    <p>"95% match led to my current role."</p>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        
        this.storiesContainer.addEventListener('click', (e) => {
            const storyCard = e.target.closest('.story-card');
            const floatingTestimonial = e.target.closest('.floating-testimonial');
            
            if (storyCard) {
                this.showFullStory(storyCard);
            }
            
            if (floatingTestimonial) {
                this.expandTestimonial(floatingTestimonial);
            }
        });

 
        this.storiesContainer.addEventListener('mouseenter', (e) => {
            const testimonial = e.target.closest('.floating-testimonial');
            if (testimonial) {
                this.highlightTestimonial(testimonial);
            }
        }, true);

        this.storiesContainer.addEventListener('mouseleave', (e) => {
            const testimonial = e.target.closest('.floating-testimonial');
            if (testimonial) {
                this.unhighlightTestimonial(testimonial);
            }
        }, true);
    }

    highlightTestimonial(testimonial) {
        testimonial.style.zIndex = '10';
        testimonial.style.transform += ' scale(1.1)';
    }

    unhighlightTestimonial(testimonial) {
        testimonial.style.zIndex = '';
        testimonial.style.transform = testimonial.style.transform.replace(' scale(1.1)', '');
    }

    showFullStory(storyCard) {
        const avatar = storyCard.querySelector('.story-avatar').textContent;
        const name = storyCard.querySelector('h4').textContent;
        const role = storyCard.querySelector('.story-info p').textContent;
        const quote = storyCard.querySelector('.story-quote').textContent;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="story-header">
                    <div class="story-avatar">${avatar}</div>
                    <div class="story-info">
                        <h4>${name}</h4>
                        <p>${role}</p>
                    </div>
                </div>
                <div class="story-quote">
                    ${quote}
                </div>
                <div class="story-details">
                    <h4>Career Journey:</h4>
                    <ul>
                        <li>Found internship through CareerLaunch</li>
                        <li>Received 3 interview invitations in first week</li>
                        <li>Accepted position with 95% match score</li>
                        <li>Converted to full-time role after internship</li>
                    </ul>
                </div>
                <div class="modal-actions">
                    <a href="registration.html" class="btn btn-primary">Start Your Journey</a>
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

    expandTestimonial(testimonial) {
        const avatar = testimonial.querySelector('.story-avatar').textContent;
        const name = testimonial.querySelector('h4').textContent;
        const role = testimonial.querySelector('p').textContent;
        const quote = testimonial.querySelector('p:last-child').textContent;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="story-header">
                    <div class="story-avatar">${avatar}</div>
                    <div class="story-info">
                        <h4>${name}</h4>
                        <p>${role}</p>
                    </div>
                </div>
                <div class="story-quote">
                    "${quote}"
                </div>
                <div class="modal-actions">
                    <a href="stories.html" class="btn btn-outline">Read Full Story</a>
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
    new Stories();
});