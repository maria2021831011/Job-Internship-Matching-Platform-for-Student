
class ApplicationsManager {
    constructor() {
        this.applications = [];
        this.filters = {
            status: 'all',
            dateRange: 'all',
            sortBy: 'newest'
        };
        this.init();
    }
    init() {
        this.loadApplications();
        this.setupEventListeners();
        this.renderApplications();
    }

    setupEventListeners() {
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.renderApplications();
        });
        document.getElementById('dateFilter')?.addEventListener('change', (e) => {
            this.filters.dateRange = e.target.value;
            this.renderApplications();
        });
        document.getElementById('sortFilter')?.addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.renderApplications();
        });
        document.getElementById('newApplicationBtn')?.addEventListener('click', () => {
            this.openApplicationModal();
        });
        document.getElementById('cancelApplication')?.addEventListener('click', () => {
            this.closeApplicationModal();
        });

        document.querySelector('.close-modal')?.addEventListener('click', () => {
            this.closeApplicationModal();
        });
        document.getElementById('applicationForm')?.addEventListener('submit', (e) => {
            this.handleApplicationSubmit(e);
        });
        document.getElementById('applicationModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'applicationModal') {
                this.closeApplicationModal();
            }
        });
    }

    loadApplications() {
        const savedApplications = localStorage.getItem('userApplications');
        this.applications = savedApplications ? JSON.parse(savedApplications) : this.getMockApplications();
    }

    getMockApplications() {
        return [
            {
                id: '1',
                jobTitle: 'Frontend Developer',
                companyName: 'TechCorp Inc.',
                applicationDate: '2024-01-15',
                status: 'interview',
                jobDescription: 'Developing modern web applications using React and TypeScript',
                notes: 'Technical interview scheduled for next week',
                salary: '$85,000 - $105,000',
                location: 'San Francisco, CA',
                jobType: 'Full-time'
            },
            {
                id: '2',
                jobTitle: 'UX Designer',
                companyName: 'DesignStudio',
                applicationDate: '2024-01-10',
                status: 'review',
                jobDescription: 'Creating user-centered designs for web and mobile applications',
                notes: 'Portfolio review in progress',
                salary: '$75,000 - $95,000',
                location: 'Remote',
                jobType: 'Full-time'
            },
            {
                id: '3',
                jobTitle: 'Product Manager',
                companyName: 'StartupXYZ',
                applicationDate: '2024-01-05',
                status: 'applied',
                jobDescription: 'Leading product development from conception to launch',
                notes: 'Waiting for initial response',
                salary: '$90,000 - $120,000',
                location: 'New York, NY',
                jobType: 'Full-time'
            }
        ];
    }

    renderApplications() {
        const container = document.getElementById('applicationsList');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;
        const filteredApplications = this.getFilteredApplications();
        if (filteredApplications.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'block';
        emptyState.style.display = 'none';
        container.innerHTML = filteredApplications.map(application => 
            this.createApplicationCard(application)
        ).join('');

        container.querySelectorAll('.application-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.viewApplicationDetails(filteredApplications[index]);
            });
        });
    }

    getFilteredApplications() {
        let filtered = [...this.applications];
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(app => app.status === this.filters.status);
        }
        if (this.filters.dateRange !== 'all') {
            const now = new Date();
            const cutoff = new Date();

            switch (this.filters.dateRange) {
                case 'week':
                    cutoff.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    cutoff.setMonth(now.getMonth() - 1);
                    break;
                case 'quarter':
                    cutoff.setMonth(now.getMonth() - 3);
                    break;
            }

            filtered = filtered.filter(app => {
                const appDate = new Date(app.applicationDate);
                return appDate >= cutoff;
            });
        }

        filtered.sort((a, b) => {
            switch (this.filters.sortBy) {
                case 'oldest':
                    return new Date(a.applicationDate) - new Date(b.applicationDate);
                case 'company':
                    return a.companyName.localeCompare(b.companyName);
                case 'newest':
                default:
                    return new Date(b.applicationDate) - new Date(a.applicationDate);
            }
        });
        return filtered;
    }

    createApplicationCard(application) {
        const statusText = this.getStatusText(application.status);
        const date = new Date(application.applicationDate).toLocaleDateString();

        return `
            <div class="application-card" data-application-id="${application.id}">
                <div class="application-card-header">
                    <div>
                        <div class="application-title">${application.jobTitle}</div>
                        <div class="application-company">${application.companyName}</div>
                    </div>
                    <div class="application-status status-${application.status}">
                        ${statusText}
                    </div>
                </div>
                <div class="application-details">
                    <div class="application-detail">
                        <span>📅</span>
                        <span>Applied: ${date}</span>
                    </div>
                    <div class="application-detail">
                        <span>💰</span>
                        <span>${application.salary || 'Not specified'}</span>
                    </div>
                    <div class="application-detail">
                        <span>📍</span>
                        <span>${application.location}</span>
                    </div>
                    <div class="application-detail">
                        <span>⏱️</span>
                        <span>${application.jobType}</span>
                    </div>
                </div>
                ${application.notes ? `
                    <div class="application-notes">
                        <strong>Notes:</strong> ${application.notes}
                    </div>
                ` : ''}
                <div class="application-actions">
                    <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); applicationsManager.editApplication('${application.id}')">
                        Edit
                    </button>
                    <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); applicationsManager.updateStatus('${application.id}')">
                        Update Status
                    </button>
                </div>
            </div>
        `;
    }
    getStatusText(status) {
        const statusMap = {
            applied: 'Applied',
            review: 'Under Review',
            interview: 'Interview',
            offer: 'Offer',
            rejected: 'Rejected'
        };
        return statusMap[status] || status;
    }
    openApplicationModal(application = null) {
        const modal = document.getElementById('applicationModal');
        const form = document.getElementById('applicationForm');      
        if (application) {
            form.dataset.editId = application.id;
            document.getElementById('jobTitle').value = application.jobTitle;
            document.getElementById('companyName').value = application.companyName;
            document.getElementById('jobDescription').value = application.jobDescription || '';
            document.getElementById('applicationDate').value = application.applicationDate;
            document.getElementById('applicationStatus').value = application.status;
            document.getElementById('notes').value = application.notes || '';
            document.querySelector('.modal-header h3').textContent = 'Edit Application';
        } else {
            form.reset();
            form.dataset.editId = '';
            document.getElementById('applicationDate').value = new Date().toISOString().split('T')[0];
            document.querySelector('.modal-header h3').textContent = 'Add New Application';
        }
        modal.classList.add('active');
    }
    closeApplicationModal() {
        document.getElementById('applicationModal').classList.remove('active');
    }
    async handleApplicationSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const applicationData = {
            id: e.target.dataset.editId || Date.now().toString(),
            jobTitle: formData.get('jobTitle'),
            companyName: formData.get('companyName'),
            jobDescription: formData.get('jobDescription'),
            applicationDate: formData.get('applicationDate'),
            status: formData.get('applicationStatus'),
            notes: formData.get('notes')
        };
        try {
            if (e.target.dataset.editId) {
                //  existing application
                const index = this.applications.findIndex(app => app.id === e.target.dataset.editId);
                if (index !== -1) {
                    this.applications[index] = { ...this.applications[index], ...applicationData };
                }
            } else {
                //new application
                this.applications.unshift(applicationData);
            }
            this.saveApplications();
            this.renderApplications();
            this.closeApplicationModal();
            this.showNotification('Application saved successfully!', 'success');
        } catch (error) {
            this.showNotification('Error saving application', 'error');
        }
    }

    editApplication(applicationId) {
        const application = this.applications.find(app => app.id === applicationId);
        if (application) {
            this.openApplicationModal(application);
        }
    }
    updateStatus(applicationId) {
        const application = this.applications.find(app => app.id === applicationId);
        if (application) {
            const newStatus = prompt('Update status:', application.status);
            if (newStatus && ['applied', 'review', 'interview', 'offer', 'rejected'].includes(newStatus)) {
                application.status = newStatus;
                this.saveApplications();
                this.renderApplications();
                this.showNotification('Status updated successfully!', 'success');
            }
        }
    }
    viewApplicationDetails(application) {
        alert(`Application Details:\n\nJob: ${application.jobTitle}\nCompany: ${application.companyName}\nStatus: ${this.getStatusText(application.status)}\nDate: ${new Date(application.applicationDate).toLocaleDateString()}`);
    }

    saveApplications() {
        localStorage.setItem('userApplications', JSON.stringify(this.applications));
    }
    showNotification(message, type = 'info') {
        // notification system from main.js or create simple one
        if (window.careerHub && window.careerHub.showNotification) {
            window.careerHub.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.applicationsManager = new ApplicationsManager();
});