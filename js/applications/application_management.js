
class ApplicationManagement {
    constructor() {
        this.applications = [];
        this.filteredApplications = [];
        this.selectedApplications = new Set();
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filters = {
            status: [],
            position: 'all',
            dateRange: 'all',
            search: ''
        };
        this.init();
    }
    init() {
        this.loadApplications();
        this.setupEventListeners();
        this.renderApplications();
        this.updateStatistics();
    }

    setupEventListeners() {
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.filters.status = Array.from(e.target.selectedOptions).map(opt => opt.value);
            this.applyFilters();
        });

        document.getElementById('positionFilter')?.addEventListener('change', (e) => {
            this.filters.position = e.target.value;
            this.applyFilters();
        });

        document.getElementById('dateFilter')?.addEventListener('change', (e) => {
            this.filters.dateRange = e.target.value;
            this.applyFilters();
        });
        document.getElementById('searchApplications')?.addEventListener('input', 
            Helpers.debounce((e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
            }, 300)
        );
        document.getElementById('selectAll')?.addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });
        document.getElementById('bulkActionBtn')?.addEventListener('click', () => {
            this.openBulkActionsModal();
        });
        document.getElementById('applyBulkActions')?.addEventListener('click', () => {
            this.applyBulkActions();
        });
        document.getElementById('cancelBulkActions')?.addEventListener('click', () => {
            this.closeBulkActionsModal();
        });
        document.getElementById('exportBtn')?.addEventListener('click', () => {
            this.exportToCSV();
        });

        this.setupModalEventListeners();
        document.getElementById('prevPage')?.addEventListener('click', () => {
            this.previousPage();
        });
        document.getElementById('nextPage')?.addEventListener('click', () => {
            this.nextPage();
        });
    }
    setupModalEventListeners() {
        document.querySelector('#applicationDetailsModal .close-modal')?.addEventListener('click', () => {
            this.closeApplicationDetailsModal();
        });

        document.querySelector('#statusUpdateModal .close-modal')?.addEventListener('click', () => {
            this.closeStatusUpdateModal();
        });
        document.getElementById('cancelStatusUpdate')?.addEventListener('click', () => {
            this.closeStatusUpdateModal();
        });

        document.getElementById('statusUpdateForm')?.addEventListener('submit', (e) => {
            this.handleStatusUpdate(e);
        });
        document.querySelector('#bulkActionsModal .close-modal')?.addEventListener('click', () => {
            this.closeBulkActionsModal();
        });
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }
    loadApplications() {
        const savedApplications = localStorage.getItem('companyApplications');
        this.applications = savedApplications ? JSON.parse(savedApplications) : this.getMockApplications();
    }

    getMockApplications() {
        return [
            {
                id: '1',
                candidate: {
                    name: 'Sarah Johnson',
                    email: 'sarah.j@example.com',
                    avatar: 'https://via.placeholder.com/60',
                    experience: '3 years',
                    location: 'San Francisco, CA'
                },
                position: 'Frontend Developer',
                appliedDate: '2024-01-15',
                status: 'new',
                lastActivity: '2024-01-15',
                resume: 'sarah_johnson_resume.pdf',
                coverLetter: 'Experienced React developer with modern web development skills...',
                skills: ['JavaScript', 'React', 'TypeScript', 'CSS'],
                education: 'BS Computer Science, Stanford University',
                notes: [
                    {
                        date: '2024-01-15',
                        author: 'Recruiter',
                        content: 'Initial application received'
                    }
                ]
            },
            {
                id: '2',
                candidate: {
                    name: 'Michael Chen',
                    email: 'michael.c@example.com',
                    avatar: 'https://via.placeholder.com/60',
                    experience: '5 years',
                    location: 'New York, NY'
                },
                position: 'Backend Developer',
                appliedDate: '2024-01-14',
                status: 'reviewed',
                lastActivity: '2024-01-16',
                resume: 'michael_chen_resume.pdf',
                coverLetter: 'Senior backend developer specializing in Node.js and cloud architecture...',
                skills: ['Node.js', 'Python', 'AWS', 'MongoDB'],
                education: 'MS Software Engineering, MIT',
                notes: [
                    {
                        date: '2024-01-14',
                        author: 'Recruiter',
                        content: 'Application under review'
                    },
                    {
                        date: '2024-01-16',
                        author: 'Tech Lead',
                        content: 'Strong backend experience, schedule interview'
                    }
                ]
            },
            {
                id: '3',
                candidate: {
                    name: 'Emily Davis',
                    email: 'emily.d@example.com',
                    avatar: 'https://via.placeholder.com/60',
                    experience: '2 years',
                    location: 'Remote'
                },
                position: 'Full Stack Developer',
                appliedDate: '2024-01-12',
                status: 'interview',
                lastActivity: '2024-01-17',
                resume: 'emily_davis_resume.pdf',
                coverLetter: 'Full stack developer with experience in React and Node.js...',
                skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
                education: 'BS Web Development, UC Berkeley',
                notes: [
                    {
                        date: '2024-01-12',
                        author: 'Recruiter',
                        content: 'Application received'
                    },
                    {
                        date: '2024-01-15',
                        author: 'Hiring Manager',
                        content: 'Technical interview scheduled for Jan 20'
                    }
                ]
            }
        ];
    }
    applyFilters() {
        this.filteredApplications = this.applications.filter(app => {
            if (this.filters.status.length > 0 && !this.filters.status.includes(app.status)) {
                return false;
            }
            if (this.filters.position !== 'all') {
                const positionMap = {
                    'frontend': 'Frontend Developer',
                    'backend': 'Backend Developer',
                    'fullstack': 'Full Stack Developer'
                };
                if (app.position !== positionMap[this.filters.position]) {
                    return false;
                }
            }
            if (this.filters.dateRange !== 'all') {
                const appDate = new Date(app.appliedDate);
                const now = new Date();
                let cutoff = new Date();

                switch (this.filters.dateRange) {
                    case 'today':
                        cutoff.setDate(now.getDate() - 1);
                        break;
                    case 'week':
                        cutoff.setDate(now.getDate() - 7);
                        break;
                    case 'month':
                        cutoff.setMonth(now.getMonth() - 1);
                        break;
                }
                if (appDate < cutoff) {
                    return false;
                }
            }
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                return (
                    app.candidate.name.toLowerCase().includes(searchTerm) ||
                    app.position.toLowerCase().includes(searchTerm) ||
                    app.candidate.email.toLowerCase().includes(searchTerm)
                );
            }
            return true;
        });
        this.currentPage = 1;
        this.renderApplications();
        this.updatePagination();
    }
    renderApplications() {
        const container = document.getElementById('applicationsTableBody');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedApplications = this.filteredApplications.slice(startIndex, endIndex);

        container.innerHTML = paginatedApplications.map(app => 
            this.createApplicationRow(app)
        ).join('');

        this.updateSelectedCount();
    }

    createApplicationRow(application) {
        const isSelected = this.selectedApplications.has(application.id);
        const appliedDate = Helpers.formatDate(application.appliedDate, 'short');
        const lastActivity = Helpers.formatRelativeTime(application.lastActivity);

        return `
            <tr data-application-id="${application.id}">
                <td class="checkbox-cell">
                    <input type="checkbox" class="application-checkbox" 
                           ${isSelected ? 'checked' : ''} 
                           onchange="applicationManagement.toggleApplicationSelection('${application.id}')">
                </td>
                <td>
                    <div class="candidate-profile">
                        <img src="${application.candidate.avatar}" alt="${application.candidate.name}" class="candidate-avatar">
                        <div class="candidate-info">
                            <div class="candidate-name">${application.candidate.name}</div>
                            <div class="candidate-email">${application.candidate.email}</div>
                        </div>
                    </div>
                </td>
                <td>${application.position}</td>
                <td>${appliedDate}</td>
                <td>
                    <span class="status-badge status-${application.status}">
                        ${this.getStatusText(application.status)}
                    </span>
                </td>
                <td>${application.candidate.experience}</td>
                <td>${lastActivity}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" 
                                onclick="applicationManagement.viewApplicationDetails('${application.id}')"
                                title="View Details">
                            👁️
                        </button>
                        <button class="btn-icon btn-edit" 
                                onclick="applicationManagement.openStatusUpdateModal('${application.id}')"
                                title="Update Status">
                            ✏️
                        </button>
                        <button class="btn-icon btn-delete" 
                                onclick="applicationManagement.deleteApplication('${application.id}')"
                                title="Delete Application">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
    getStatusText(status) {
        const statusMap = {
            'new': 'New',
            'reviewed': 'Reviewed',
            'interview': 'Interview',
            'shortlisted': 'Shortlisted',
            'rejected': 'Rejected',
            'hired': 'Hired'
        };
        return statusMap[status] || status;
    }
    toggleApplicationSelection(applicationId) {
        if (this.selectedApplications.has(applicationId)) {
            this.selectedApplications.delete(applicationId);
        } else {
            this.selectedApplications.add(applicationId);
        }
        this.updateSelectedCount();
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.application-checkbox');
        const currentPageApplications = this.getCurrentPageApplications();

        if (checked) {
            currentPageApplications.forEach(app => this.selectedApplications.add(app.id));
        } else {
            currentPageApplications.forEach(app => this.selectedApplications.delete(app.id));
        }
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.updateSelectedCount();
    }
    getCurrentPageApplications() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredApplications.slice(startIndex, endIndex);
    }
    updateSelectedCount() {
        const count = this.selectedApplications.size;
        document.getElementById('selectedApplicationsCount').textContent = count;
        document.getElementById('bulkActionBtn').disabled = count === 0;
    }
    viewApplicationDetails(applicationId) {
        const application = this.applications.find(app => app.id === applicationId);
        if (!application) return;

        const modal = document.getElementById('applicationDetailsModal');
        const content = document.getElementById('applicationDetailsContent');
        content.innerHTML = this.createApplicationDetails(application);
        modal.classList.add('active');
    }
    createApplicationDetails(application) {
        const appliedDate = Helpers.formatDate(application.appliedDate, 'long');
        const lastActivity = Helpers.formatDate(application.lastActivity, 'long');

        return `
            <div class="application-details">
                <!-- Candidate Overview -->
                <div class="detail-section">
                    <h4>Candidate Information</h4>
                    <div class="candidate-profile">
                        <img src="${application.candidate.avatar}" alt="${application.candidate.name}" class="candidate-avatar">
                        <div class="candidate-info">
                            <h4>${application.candidate.name}</h4>
                            <p>${application.candidate.email}</p>
                            <p>${application.candidate.location} • ${application.candidate.experience} experience</p>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Application Details</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Position Applied</span>
                            <span class="detail-value">${application.position}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Applied Date</span>
                            <span class="detail-value">${appliedDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status</span>
                            <span class="detail-value status-badge status-${application.status}">
                                ${this.getStatusText(application.status)}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Last Activity</span>
                            <span class="detail-value">${lastActivity}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Skills & Qualifications</h4>
                    <div class="skills-list" style="margin-bottom: 1rem;">
                        ${application.skills.map(skill => `
                            <span class="skill-tag">${skill}</span>
                        `).join('')}
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Education</span>
                        <span class="detail-value">${application.education}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Cover Letter</h4>
                    <p>${application.coverLetter}</p>
                </div>

                <div class="detail-section">
                    <h4>Activity Timeline</h4>
                    <div class="activity-timeline">
                        ${application.notes.map(note => `
                            <div class="activity-item">
                                <div class="activity-icon">📝</div>
                                <div class="activity-content">
                                    <div class="activity-title">${note.author}</div>
                                    <div class="activity-description">${note.content}</div>
                                    <div class="activity-time">${Helpers.formatDate(note.date, 'long')}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Actions</h4>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="applicationManagement.downloadResume('${application.id}')">
                            Download Resume
                        </button>
                        <button class="btn btn-secondary" onclick="applicationManagement.openStatusUpdateModal('${application.id}')">
                            Update Status
                        </button>
                        <button class="btn btn-secondary" onclick="applicationManagement.scheduleInterview('${application.id}')">
                            Schedule Interview
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    openStatusUpdateModal(applicationId) {
        const application = this.applications.find(app => app.id === applicationId);
        if (!application) return;

        document.getElementById('updateApplicationId').value = applicationId;
        document.getElementById('newStatus').value = application.status;
        document.getElementById('statusNotes').value = '';

        document.getElementById('statusUpdateModal').classList.add('active');
    }

    async handleStatusUpdate(e) {
        e.preventDefault();
        
        const applicationId = document.getElementById('updateApplicationId').value;
        const newStatus = document.getElementById('newStatus').value;
        const notes = document.getElementById('statusNotes').value;

        const application = this.applications.find(app => app.id === applicationId);
        if (application) {
            const oldStatus = application.status;
            application.status = newStatus;
            application.lastActivity = new Date().toISOString().split('T')[0];
            application.notes.push({
                date: new Date().toISOString().split('T')[0],
                author: 'Recruiter',
                content: `Status changed from ${this.getStatusText(oldStatus)} to ${this.getStatusText(newStatus)}${notes ? `: ${notes}` : ''}`
            });

            await this.saveApplications();
            this.renderApplications();
            this.updateStatistics();
            this.closeStatusUpdateModal();
            
            this.showNotification(`Application status updated to ${this.getStatusText(newStatus)}`, 'success');
        }
    }
    openBulkActionsModal() {
        if (this.selectedApplications.size === 0) return;
        document.getElementById('bulkActionsModal').classList.add('active');
    }
    async applyBulkActions() {
        const action = document.getElementById('bulkAction').value;
        const message = document.getElementById('bulkMessage').value;
        const selectedIds = Array.from(this.selectedApplications);
        
        for (const applicationId of selectedIds) {
            const application = this.applications.find(app => app.id === applicationId);
            if (application) {
                switch (action) {
                    case 'move_to_reviewed':
                        application.status = 'reviewed';
                        break;
                    case 'move_to_interview':
                        application.status = 'interview';
                        break;
                    case 'move_to_shortlisted':
                        application.status = 'shortlisted';
                        break;
                    case 'reject':
                        application.status = 'rejected';
                        break;
                }
                application.lastActivity = new Date().toISOString().split('T')[0];
                application.notes.push({
                    date: new Date().toISOString().split('T')[0],
                    author: 'System',
                    content: `Bulk action: ${action.replace(/_/g, ' ')}${message ? ` - ${message}` : ''}`
                });
            }
        }
        await this.saveApplications();
        this.renderApplications();
        this.updateStatistics();
        this.closeBulkActionsModal();
        this.selectedApplications.clear();
        this.updateSelectedCount();
        this.showNotification(`Bulk action applied to ${selectedIds.length} applications`, 'success');
    }
    deleteApplication(applicationId) {
        if (confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
            this.applications = this.applications.filter(app => app.id !== applicationId);
            this.selectedApplications.delete(applicationId);
            this.saveApplications();
            this.renderApplications();
            this.updateStatistics();
            this.showNotification('Application deleted successfully', 'success');
        }
    }
    downloadResume(applicationId) {
        const application = this.applications.find(app => app.id === applicationId);
        if (application) {
            this.showNotification(`Downloading ${application.candidate.name}'s resume...`, 'info');
            //actual file download
        }
    }
    scheduleInterview(applicationId) {
        const application = this.applications.find(app => app.id === applicationId);
        if (application) {
            // scheduling interface
            this.showNotification(`Scheduling interview with ${application.candidate.name}...`, 'info');
        }
    }
    exportToCSV() {
        const headers = ['Name', 'Email', 'Position', 'Applied Date', 'Status', 'Experience', 'Last Activity'];
        const csvData = this.filteredApplications.map(app => [
            app.candidate.name,
            app.candidate.email,
            app.position,
            app.appliedDate,
            this.getStatusText(app.status),
            app.candidate.experience,
            app.lastActivity
        ]);
        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Applications exported to CSV', 'success');
    }
    updateStatistics() {
        const total = this.applications.length;
        const newThisWeek = this.applications.filter(app => {
            const appDate = new Date(app.appliedDate);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return appDate >= weekAgo;
        }).length;

        const hiredCount = this.applications.filter(app => app.status === 'hired').length;

        document.getElementById('totalApplications').textContent = total;
        document.getElementById('newApplications').textContent = newThisWeek;
        document.getElementById('hiredCount').textContent = hiredCount;
        document.getElementById('avgResponseTime').textContent = '24h'; // Simplified calculation
    }

    updatePagination() {
        const totalItems = this.filteredApplications.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(startItem + this.itemsPerPage - 1, totalItems);

        document.getElementById('showingStart').textContent = startItem;
        document.getElementById('showingEnd').textContent = endItem;
        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === totalPages;

        const pageNumbersContainer = document.getElementById('pageNumbers');
        pageNumbersContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => this.goToPage(i);
            pageNumbersContainer.appendChild(pageBtn);
        }
    }
    goToPage(page) {
        this.currentPage = page;
        this.renderApplications();
        this.updatePagination();
    }
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderApplications();
            this.updatePagination();
        }
    }
    nextPage() {
        const totalPages = Math.ceil(this.filteredApplications.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderApplications();
            this.updatePagination();
        }
    }

    closeApplicationDetailsModal() {
        document.getElementById('applicationDetailsModal').classList.remove('active');
    }
    closeStatusUpdateModal() {
        document.getElementById('statusUpdateModal').classList.remove('active');
    }
    closeBulkActionsModal() {
        document.getElementById('bulkActionsModal').classList.remove('active');
    }
    async saveApplications() {
        localStorage.setItem('companyApplications', JSON.stringify(this.applications));
    }
    showNotification(message, type = 'info') {
        if (window.careerHub && window.careerHub.showNotification) {
            window.careerHub.showNotification(message, type);
        } else {
            Helpers.showToast(message, type);
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    window.applicationManagement = new ApplicationManagement();
});