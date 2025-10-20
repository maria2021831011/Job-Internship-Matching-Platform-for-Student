
class Jobs {
    constructor() {
        this.jobsFilter = document.getElementById('jobsFilter');
        this.jobsGrid = document.getElementById('jobsGrid');
        this.activeFilter = 'all';
        this.init();
    }

    init() {
        this.renderFilters();
        this.renderJobs();
        this.addEventListeners();
    }

    renderFilters() {
        const filters = [
            { id: 'all', label: 'All Jobs' },
            { id: 'internships', label: 'Internships' },
            { id: 'part-time', label: 'Part-Time' },
            { id: 'remote', label: 'Remote' },
            { id: 'tech', label: 'Tech' },
            { id: 'design', label: 'Design' },
            { id: 'business', label: 'Business' }
        ];

        this.jobsFilter.innerHTML = filters.map(filter => `
            <div class="filter-btn ${filter.id === this.activeFilter ? 'active' : ''}" 
                 data-filter="${filter.id}">
                ${filter.label}
            </div>
        `).join('');
    }

    renderJobs() {
        this.jobsGrid.innerHTML = CONFIG.jobs.map(job => `
            <div class="job-card" data-type="${job.type.toLowerCase()}" data-category="${job.skills[0].toLowerCase()}">
                <div class="job-header">
                    <div class="job-info">
                        <h3>${job.title}</h3>
                        <span class="job-company">${job.company}</span>
                        <span class="job-type">${job.type}</span>
                    </div>
                    <div>
                        <div class="match-badge">
                            <i class="fas fa-bolt"></i> ${job.match} Match
                        </div>
                        <div class="posted-date">Posted ${job.posted}</div>
                    </div>
                </div>
                <div class="job-details">
                    <div class="job-meta">
                        <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                        <span><i class="fas fa-clock"></i> ${job.schedule}</span>
                        <span><i class="fas fa-money-bill-wave"></i> ${job.salary}</span>
                    </div>
                    <div class="job-skills">
                        ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                    <div class="job-actions">
                        <a href="login.html" class="btn btn-primary">Apply Now</a>
                        <a href="#" class="btn btn-outline save-job-btn"><i class="far fa-bookmark"></i></a>
                    </div>
                </div>
            </div>
        `).join('');

    }

    addEventListeners() {
  
        this.jobsFilter.addEventListener('click', (e) => {
            const filterBtn = e.target.closest('.filter-btn');
            if (filterBtn) this.setActiveFilter(filterBtn.dataset.filter);
        });


        this.jobsGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.job-card');

            if (e.target.closest('.save-job-btn') && card) {
                e.preventDefault();
                this.toggleSaveJob(card);
            }

            if (e.target.closest('.btn-primary') && card) {
                e.preventDefault();
                this.handleJobApply(card);
            }
        });

    
        this.jobsGrid.addEventListener('mouseenter', (e) => {
            const card = e.target.closest('.job-card');
            if (card) this.enhanceJobCard(card);
        }, true);

        this.jobsGrid.addEventListener('mouseleave', (e) => {
            const card = e.target.closest('.job-card');
            if (card) this.resetJobCard(card);
        }, true);
    }

    setActiveFilter(filter) {
        this.activeFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.filterJobs();
    }

    filterJobs() {
        document.querySelectorAll('.job-card').forEach(card => {
            const type = card.dataset.type;
            const category = card.dataset.category;
            card.style.display = (this.activeFilter === 'all' || type.includes(this.activeFilter) || category.includes(this.activeFilter)) ? 'block' : 'none';
        });
    }

    enhanceJobCard(card) { card.style.transform = 'translateY(-5px)'; }
    resetJobCard(card) { card.style.transform = 'translateY(0)'; }

    toggleSaveJob(card) {
        const icon = card.querySelector('.save-job-btn i');
        const isSaved = icon.classList.contains('fas');
        icon.className = isSaved ? 'far fa-bookmark' : 'fas fa-bookmark';
        this.showNotification(isSaved ? 'Job removed from saved items' : 'Job saved successfully', isSaved ? 'info' : 'success');
    }

    handleJobApply(card) {
        const isLoggedIn = false; 
        if (isLoggedIn) this.showApplicationModal(card);
        else window.location.href = 'login.html?redirect=apply';
    }

    showApplicationModal(card) {
        const jobTitle = card.querySelector('h3').textContent;
        const company = card.querySelector('.job-company').textContent;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Apply for ${jobTitle}</h2>
                <p>at ${company}</p>
                <div class="application-form">
                    <div class="form-group">
                        <label>Cover Letter</label>
                        <textarea placeholder="Why are you interested in this position?" rows="4"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Availability</label>
                        <select>
                            <option>Immediately</option>
                            <option>2 weeks notice</option>
                            <option>1 month notice</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Submit Application</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        modal.querySelector('.close-modal').addEventListener('click', () => document.body.removeChild(modal));
        modal.addEventListener('click', (e) => { if (e.target === modal) document.body.removeChild(modal); });
        modal.querySelector('button').addEventListener('click', () => {
            this.showNotification('Application submitted successfully!', 'success');
            document.body.removeChild(modal);
        });
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}


document.addEventListener('DOMContentLoaded', () => new Jobs());
