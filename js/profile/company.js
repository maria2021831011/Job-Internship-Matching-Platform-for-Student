
class CompanyProfile {
    constructor() {
        this.profileData = null;
        this.currentTab = 'basic';
        this.init();
    }
    init() {
        this.loadProfileData();
        this.setupEventListeners();
        this.setupTabNavigation();
        this.renderProfile();
        this.updateStatistics();
    }
    setupEventListeners() {
        //Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(item.dataset.tab);
            });
        });
        document.getElementById('editBasicBtn')?.addEventListener('click', () => {
            this.toggleEditMode('basic');
        });
        document.getElementById('editAboutBtn')?.addEventListener('click', () => {
            this.toggleEditMode('about');
        });
        //Form submissions
        document.getElementById('basicForm')?.addEventListener('submit', (e) => {
            this.handleBasicFormSubmit(e);
        });
        document.getElementById('aboutForm')?.addEventListener('submit', (e) => {
            this.handleAboutFormSubmit(e);
        });
        document.getElementById('cancelBasic')?.addEventListener('click', () => {
            this.toggleEditMode('basic', false);
            this.renderBasicForm();
        });
        document.getElementById('cancelAbout')?.addEventListener('click', () => {
            this.toggleEditMode('about', false);
            this.renderAboutForm();
        });

        //Team 
        document.getElementById('addMemberBtn')?.addEventListener('click', () => {
            this.openTeamMemberModal();
        });

        document.getElementById('teamMemberForm')?.addEventListener('submit', (e) => {
            this.handleTeamMemberSubmit(e);
        });
        //Job management
        document.getElementById('createJobBtn')?.addEventListener('click', () => {
            this.openCreateJobModal();
        });
        document.getElementById('createJobForm')?.addEventListener('submit', (e) => {
            this.handleJobCreateSubmit(e);
        });
        document.getElementById('deleteAccountBtn')?.addEventListener('click', () => {
            this.deleteCompanyAccount();
        });

        //Character count 
        document.getElementById('description')?.addEventListener('input', (e) => {
            this.updateCharacterCount(e.target);
        });
        //Logo upload
        document.getElementById('uploadLogoBtn')?.addEventListener('click', () => {
            this.uploadCompanyLogo();
        });
        this.setupModalEventListeners();
    }

    setupModalEventListeners() {
        //Team member 
        document.querySelector('#teamMemberModal .close-modal')?.addEventListener('click', () => {
            this.closeTeamMemberModal();
        });

        document.getElementById('cancelMember')?.addEventListener('click', () => {
            this.closeTeamMemberModal();
        });
        document.querySelector('#createJobModal .close-modal')?.addEventListener('click', () => {
            this.closeCreateJobModal();
        });

        document.getElementById('cancelJob')?.addEventListener('click', () => {
            this.closeCreateJobModal();
        });
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }
    setupTabNavigation() {
        this.switchTab('basic');
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        this.currentTab = tabName;
    }
    loadProfileData() {
        const savedProfile = localStorage.getItem('companyProfile');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (savedProfile) {
            this.profileData = JSON.parse(savedProfile);
        } else {
            this.profileData = this.getDefaultProfileData(currentUser);
        }
    }
    getDefaultProfileData(user) {
        return {
            basic: {
                companyName: user.name || 'Your Company',
                website: '',
                industry: 'technology',
                companySize: '11-50',
                founded: '',
                phone: '',
                email: user.email || '',
                address: ''
            },
            about: {
                tagline: '',
                description: '',
                mission: '',
                values: ['Innovation', 'Teamwork', 'Excellence'],
                photos: []
            },
            team: [
                {
                    id: '1',
                    name: 'John Smith',
                    role: 'CEO & Founder',
                    email: 'john@company.com',
                    bio: 'Visionary leader with 15+ years of industry experience.',
                    photo: 'https://via.placeholder.com/60'
                }
            ],
            jobs: [
                {
                    id: '1',
                    title: 'Senior Frontend Developer',
                    department: 'Engineering',
                    type: 'full-time',
                    location: 'San Francisco, CA',
                    salaryMin: 90000,
                    salaryMax: 130000,
                    description: 'We are looking for an experienced Frontend Developer to join our growing team...',
                    requirements: '5+ years of experience with React, TypeScript, and modern web technologies...',
                    benefits: 'Health insurance, remote work options, professional development budget...',
                    deadline: '2024-02-15',
                    status: 'active',
                    createdAt: '2024-01-10',
                    applications: 24
                }
            ],
            settings: {
                notifications: {
                    newApplications: true,
                    applicationUpdates: true,
                    jobExpiry: true
                },
                application: {
                    autoReply: 'Thank you for your application! We will review it and get back to you soon.',
                    enableAutoReply: true
                },
                privacy: {
                    profileVisible: true,
                    showTeamMembers: true
                }
            }
        };
    }

    renderProfile() {
        this.renderBasicForm();
        this.renderAboutForm();
        this.renderTeamMembers();
        this.renderJobs();
        this.renderSettings();
        this.updateProfileSummary();
    }
    renderBasicForm() {
        const basic = this.profileData.basic;
        
        document.getElementById('companyNameInput').value = basic.companyName;
        document.getElementById('website').value = basic.website;
        document.getElementById('industry').value = basic.industry;
        document.getElementById('companySize').value = basic.companySize;
        document.getElementById('founded').value = basic.founded;
        document.getElementById('phone').value = basic.phone;
        document.getElementById('email').value = basic.email;
        document.getElementById('address').value = basic.address;
    }

    renderAboutForm() {
        const about = this.profileData.about;
        
        document.getElementById('tagline').value = about.tagline;
        document.getElementById('description').value = about.description;
        document.getElementById('mission').value = about.mission;
        this.updateCharacterCount(document.getElementById('description'));
        this.renderValues(about.values);
        this.renderPhotos(about.photos);
    }

    renderValues(values) {
        const container = document.getElementById('valuesContainer');
        if (!container) return;

        container.innerHTML = values.map((value, index) => `
            <div class="value-item">
                <input type="text" value="${value}" ${this.isAboutEditable() ? '' : 'readonly'}>
                ${this.isAboutEditable() ? `
                    <button type="button" class="remove-value" onclick="companyProfile.removeValue(${index})">&times;</button>
                ` : ''}
            </div>
        `).join('');
        const addValueBtn = document.getElementById('addValueBtn');
        if (addValueBtn) {
            addValueBtn.style.display = this.isAboutEditable() ? 'block' : 'none';
            addValueBtn.onclick = () => this.addValue();
        }
    }

    renderPhotos(photos) {
        const container = document.getElementById('photosGrid');
        if (!container) return;

        if (photos.length === 0) {
            container.innerHTML = '<p class="no-photos">No photos uploaded yet.</p>';
        } else {
            container.innerHTML = photos.map((photo, index) => `
                <div class="photo-item">
                    <img src="${photo}" alt="Company photo">
                    ${this.isAboutEditable() ? `
                        <button type="button" class="remove-photo" onclick="companyProfile.removePhoto(${index})">&times;</button>
                    ` : ''}
                </div>
            `).join('');
        }

        //Show/hide upload button
        const uploadBtn = document.getElementById('uploadPhotoBtn');
        if (uploadBtn) {
            uploadBtn.style.display = this.isAboutEditable() ? 'block' : 'none';
            uploadBtn.onclick = () => document.getElementById('photoUpload').click();
        }
        const uploadInput = document.getElementById('photoUpload');
        if (uploadInput) {
            uploadInput.onchange = (e) => this.handlePhotoUpload(e);
        }
    }
    renderTeamMembers() {
        const container = document.getElementById('teamMembers');
        if (!container) return;

        if (this.profileData.team.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No team members added yet.</p>
                </div>
            `;
            return;
        }
        container.innerHTML = this.profileData.team.map(member => `
            <div class="team-member-card">
                <div class="member-header">
                    <img src="${member.photo || 'https://via.placeholder.com/60'}" alt="${member.name}" class="member-avatar">
                    <div class="member-info">
                        <h4>${member.name}</h4>
                        <p class="member-role">${member.role}</p>
                        ${member.email ? `<p class="member-email">${member.email}</p>` : ''}
                    </div>
                </div>
                ${member.bio ? `<p class="member-bio">${member.bio}</p>` : ''}
                <div class="member-actions">
                    <button class="btn btn-secondary btn-small" onclick="companyProfile.editTeamMember('${member.id}')">
                        Edit
                    </button>
                    <button class="btn btn-primary btn-small" onclick="companyProfile.deleteTeamMember('${member.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderJobs() {
        const container = document.getElementById('jobsList');
        if (!container) return;

        if (this.profileData.jobs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No job posts created yet.</p>
                    <button class="btn btn-primary" onclick="companyProfile.openCreateJobModal()">Create Your First Job Post</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.profileData.jobs.map(job => `
            <div class="job-card">
                <div class="job-header">
                    <div>
                        <div class="job-title">${job.title}</div>
                        <div class="job-meta">
                            <span>${this.getJobTypeText(job.type)}</span>
                            <span>📍 ${job.location}</span>
                            ${job.salaryMin ? `<span>💰 $${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}</span>` : ''}
                            <span>📅 Posted ${Helpers.formatRelativeTime(job.createdAt)}</span>
                        </div>
                    </div>
                    <span class="job-status status-${job.status}">
                        ${this.getJobStatusText(job.status)}
                    </span>
                </div>
                <p class="job-description">${job.description}</p>
                <div class="job-footer">
                    <div class="job-stats">
                        <span>📥 ${job.applications || 0} applications</span>
                        ${job.deadline ? `<span>⏰ Closes ${Helpers.formatDate(job.deadline, 'short')}</span>` : ''}
                    </div>
                    <div class="job-actions">
                        <button class="btn btn-secondary btn-small" onclick="companyProfile.viewJobApplications('${job.id}')">
                            View Applications
                        </button>
                        <button class="btn btn-primary btn-small" onclick="companyProfile.editJob('${job.id}')">
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    renderSettings() {
        const settings = this.profileData.settings;
        
        document.getElementById('notifyNewApplications').checked = settings.notifications.newApplications;
        document.getElementById('notifyApplicationUpdates').checked = settings.notifications.applicationUpdates;
        document.getElementById('notifyJobExpiry').checked = settings.notifications.jobExpiry;
        //Application 
        document.getElementById('autoReply').value = settings.application.autoReply;
        document.getElementById('enableAutoReply').checked = settings.application.enableAutoReply;
        // Privacy
        document.getElementById('profileVisible').checked = settings.privacy.profileVisible;
        document.getElementById('showTeamMembers').checked = settings.privacy.showTeamMembers;
    }
    updateProfileSummary() {
        const basic = this.profileData.basic;
        document.getElementById('companyName').textContent = basic.companyName;
        document.getElementById('companyIndustry').textContent = this.getIndustryText(basic.industry);
   
        const logo = document.getElementById('companyLogo');
        if (basic.logo) {
            logo.src = basic.logo;
        }
    }
    updateStatistics() {
        const activeJobs = this.profileData.jobs.filter(job => job.status === 'active').length;
        const totalApplications = this.profileData.jobs.reduce((sum, job) => sum + (job.applications || 0), 0);

        document.getElementById('activeJobs').textContent = activeJobs;
        document.getElementById('totalApplications').textContent = totalApplications;
        document.getElementById('totalJobs').textContent = this.profileData.jobs.length;
        document.getElementById('activeJobsCount').textContent = activeJobs;
        document.getElementById('totalApplicationsCount').textContent = totalApplications;
    }
    toggleEditMode(section, enable = true) {
        const form = document.getElementById(`${section}Form`);
        const actions = document.getElementById(`${section}Actions`);
        const editBtn = document.getElementById(`edit${section.charAt(0).toUpperCase() + section.slice(1)}Btn`);

        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type !== 'hidden' && !input.classList.contains('remove-value') && !input.classList.contains('remove-photo')) {
                input.readOnly = !enable;
                input.disabled = !enable;
            }
        });

        if (enable) {
            actions.style.display = 'flex';
            editBtn.style.display = 'none';

            if (section === 'about') {
                this.setupAboutEditMode();
            }
        } else {
            actions.style.display = 'none';
            editBtn.style.display = 'block';
            if (section === 'about') {
                this.cleanupAboutEditMode();
            }
        }
    }

    setupAboutEditMode() {
        const valueInputs = document.querySelectorAll('.value-item input');
        valueInputs.forEach(input => {
            input.readOnly = false;
        });
        document.getElementById('addValueBtn').style.display = 'block';
        document.getElementById('uploadPhotoBtn').style.display = 'block';
    }

    cleanupAboutEditMode() {
        const valueInputs = document.querySelectorAll('.value-item input');
        valueInputs.forEach(input => {
            input.readOnly = true;
        });
        document.getElementById('addValueBtn').style.display = 'none';
        document.getElementById('uploadPhotoBtn').style.display = 'none';
    }
    isAboutEditable() {
        return document.getElementById('aboutActions')?.style.display === 'flex';
    }
    async handleBasicFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        this.profileData.basic = {
            ...this.profileData.basic,
            companyName: formData.get('companyName'),
            website: formData.get('website'),
            industry: formData.get('industry'),
            companySize: formData.get('companySize'),
            founded: formData.get('founded'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            address: formData.get('address')
        };
        await this.saveProfile();
        this.toggleEditMode('basic', false);
        this.updateProfileSummary();
        this.showNotification('Basic information updated successfully!', 'success');
    }

    async handleAboutFormSubmit(e) {
        e.preventDefault();
        const values = [];
        document.querySelectorAll('.value-item input').forEach(input => {
            if (input.value.trim()) {
                values.push(input.value.trim());
            }
        });
        this.profileData.about = {
            ...this.profileData.about,
            tagline: document.getElementById('tagline').value,
            description: document.getElementById('description').value,
            mission: document.getElementById('mission').value,
            values: values
        };

        await this.saveProfile();
        this.toggleEditMode('about', false);
        this.showNotification('About information updated successfully!', 'success');
    }
    addValue() {
        this.profileData.about.values.push('New Value');
        this.renderValues(this.profileData.about.values);
    }
    removeValue(index) {
        this.profileData.about.values.splice(index, 1);
        this.renderValues(this.profileData.about.values);
    }
    removePhoto(index) {
        this.profileData.about.photos.splice(index, 1);
        this.renderPhotos(this.profileData.about.photos);
    }
    handlePhotoUpload(e) {
        const files = e.target.files;
        if (!files.length) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                this.profileData.about.photos.push(event.target.result);
                this.renderPhotos(this.profileData.about.photos);
                this.showNotification('Photo uploaded successfully!', 'success');
            };
            reader.readAsDataURL(file);
        });

        //Reset input
        e.target.value = '';
    }

    openTeamMemberModal(member = null) {
        const modal = document.getElementById('teamMemberModal');
        const form = document.getElementById('teamMemberForm');
        
        if (member) {
            form.dataset.editId = member.id;
            document.getElementById('memberId').value = member.id;
            document.getElementById('memberName').value = member.name;
            document.getElementById('memberRole').value = member.role;
            document.getElementById('memberEmail').value = member.email || '';
            document.getElementById('memberBio').value = member.bio || '';
            document.getElementById('memberPhoto').value = member.photo || '';
            document.getElementById('teamMemberModalTitle').textContent = 'Edit Team Member';
        } else {
            form.reset();
            form.dataset.editId = '';
            document.getElementById('teamMemberModalTitle').textContent = 'Add Team Member';
        }
        modal.classList.add('active');
    }
    async handleTeamMemberSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const memberData = {
            id: formData.get('id') || Date.now().toString(),
            name: formData.get('name'),
            role: formData.get('role'),
            email: formData.get('email'),
            bio: formData.get('bio'),
            photo: formData.get('photo') || 'https://via.placeholder.com/60'
        };
        if (e.target.dataset.editId) {
            //Update existing member
            const index = this.profileData.team.findIndex(member => member.id === e.target.dataset.editId);
            if (index !== -1) {
                this.profileData.team[index] = memberData;
            }
        } else {
            //new member
            this.profileData.team.push(memberData);
        }
        await this.saveProfile();
        this.renderTeamMembers();
        this.closeTeamMemberModal();
        this.showNotification('Team member saved successfully!', 'success');
    }
    editTeamMember(memberId) {
        const member = this.profileData.team.find(m => m.id === memberId);
        if (member) {
            this.openTeamMemberModal(member);
        }
    }
    deleteTeamMember(memberId) {
        if (confirm('Are you sure you want to delete this team member?')) {
            this.profileData.team = this.profileData.team.filter(m => m.id !== memberId);
            this.saveProfile();
            this.renderTeamMembers();
            this.showNotification('Team member deleted successfully!', 'success');
        }
    }

    openCreateJobModal(job = null) {
        const modal = document.getElementById('createJobModal');
        const form = document.getElementById('createJobForm');
        
        if (job) {
             //edit mode
        } else {
            //Create mode
            form.reset();
            document.getElementById('jobStatus').value = 'active';
        }
        
        modal.classList.add('active');
    }
    async handleJobCreateSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const jobData = {
            id: Date.now().toString(),
            title: formData.get('jobTitle'),
            department: formData.get('department'),
            type: formData.get('jobType'),
            location: formData.get('location'),
            salaryMin: parseInt(formData.get('salaryMin')) || null,
            salaryMax: parseInt(formData.get('salaryMax')) || null,
            description: formData.get('description'),
            requirements: formData.get('requirements'),
            benefits: formData.get('benefits'),
            deadline: formData.get('deadline'),
            status: formData.get('status'),
            createdAt: new Date().toISOString().split('T')[0],
            applications: 0
        };
        this.profileData.jobs.unshift(jobData);
        await this.saveProfile();
        this.renderJobs();
        this.updateStatistics();
        this.closeCreateJobModal();
        this.showNotification('Job post created successfully!', 'success');
    }
    viewJobApplications(jobId) {
        //Navigate to application management 
        window.location.href = '../applications/application_management.html';
    }
    editJob(jobId) {
        this.showNotification('Edit job functionality coming soon...', 'info');
    }
    uploadCompanyLogo() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById('companyLogo').src = event.target.result;
                    this.profileData.basic.logo = event.target.result;
                    this.saveProfile();
                    this.showNotification('Company logo updated successfully!', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }
    deleteCompanyAccount() {
        if (confirm('Are you sure you want to delete your company account? This action cannot be undone and will remove all your data.')) {
            //Simulate account deletion
            localStorage.removeItem('companyProfile');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            this.showNotification('Company account deleted successfully', 'success');
            
            //Redirect - home page
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 2000);
        }
    }
    updateCharacterCount(textarea) {
        const count = textarea.value.length;
        document.getElementById('descriptionChars').textContent = count;
    }
    closeTeamMemberModal() {
        document.getElementById('teamMemberModal').classList.remove('active');
    }
    closeCreateJobModal() {
        document.getElementById('createJobModal').classList.remove('active');
    }
    //Utility
    getIndustryText(industry) {
        const industries = {
            'technology': 'Technology',
            'healthcare': 'Healthcare',
            'finance': 'Finance',
            'education': 'Education',
            'retail': 'Retail',
            'manufacturing': 'Manufacturing',
            'other': 'Other'
        };
        return industries[industry] || industry;
    }
    getJobTypeText(type) {
        const types = {
            'full-time': 'Full-time',
            'part-time': 'Part-time',
            'contract': 'Contract',
            'internship': 'Internship',
            'remote': 'Remote'
        };
        return types[type] || type;
    }
    getJobStatusText(status) {
        const statuses = {
            'active': 'Active',
            'draft': 'Draft',
            'closed': 'Closed'
        };
        return statuses[status] || status;
    }
    async saveProfile() {
        localStorage.setItem('companyProfile', JSON.stringify(this.profileData));
    }
    showNotification(message, type = 'info') {
        if (window.careerHub && window.careerHub.showNotification) {
            window.careerHub.showNotification(message, type);
        } else {
            Helpers.showToast(message, type);
        }
    }
}

//Initialize company profile
document.addEventListener('DOMContentLoaded', () => {
    window.companyProfile = new CompanyProfile();
});