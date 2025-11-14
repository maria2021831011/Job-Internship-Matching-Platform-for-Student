
class StudentProfile {
    constructor() {
        this.profileData = null;
        this.currentTab = 'personal';
        this.init();
    }

    init() {
        this.loadProfileData();
        this.setupEventListeners();
        this.setupTabNavigation();
        this.renderProfile();
    }

    setupEventListeners() {
        //Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(item.dataset.tab);
            });
        });
        document.getElementById('editPersonalBtn')?.addEventListener('click', () => {
            this.toggleEditMode('personal');
        });

        document.getElementById('editPreferencesBtn')?.addEventListener('click', () => {
            this.toggleEditMode('preferences');
        });

        //Form submissions
        document.getElementById('personalForm')?.addEventListener('submit', (e) => {
            this.handlePersonalFormSubmit(e);
        });

        document.getElementById('preferencesForm')?.addEventListener('submit', (e) => {
            this.handlePreferencesFormSubmit(e);
        });
        document.getElementById('cancelPersonal')?.addEventListener('click', () => {
            this.toggleEditMode('personal', false);
            this.renderPersonalForm();
        });

        document.getElementById('cancelPreferences')?.addEventListener('click', () => {
            this.toggleEditMode('preferences', false);
            this.renderPreferencesForm();
        });
        document.getElementById('addEducationBtn')?.addEventListener('click', () => {
            this.openEducationModal();
        });

        document.getElementById('educationForm')?.addEventListener('submit', (e) => {
            this.handleEducationFormSubmit(e);
        });
        document.getElementById('saveSkillBtn')?.addEventListener('click', () => {
            this.addSkill();
        });
        document.getElementById('skillInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addSkill();
            }
        });
        document.getElementById('uploadImageBtn')?.addEventListener('click', () => {
            this.uploadProfileImage();
        });
    }
    setupTabNavigation() {
        //Show initial tab
        this.switchTab('personal');
    }
    switchTab(tabName) {
        //Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        //update tab 
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        this.currentTab = tabName;
    }

    loadProfileData() {
        //default data
        const savedProfile = localStorage.getItem('studentProfile');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (savedProfile) {
            this.profileData = JSON.parse(savedProfile);
        } else {
            this.profileData = this.getDefaultProfileData(currentUser);
        }
        //Load applications count
        this.loadApplicationStats();
    }
    getDefaultProfileData(user) {
        return {
            personal: {
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ')[1] || '',
                email: user.email || '',
                phone: '',
                location: '',
                headline: '',
                summary: ''
            },
            education: [],
            experience: [],
            skills: ['JavaScript', 'React', 'HTML', 'CSS', 'Git'],
            preferences: {
                jobTypes: ['full-time'],
                location: '',
                minSalary: '',
                industries: ''
            }
        };
    }
    loadApplicationStats() {
        const applications = JSON.parse(localStorage.getItem('userApplications') || '[]');
        const interviews = applications.filter(app => app.status === 'interview').length;
        
        document.getElementById('applicationsCount').textContent = applications.length;
        document.getElementById('interviewsCount').textContent = interviews;
    }
    renderProfile() {
        this.renderPersonalForm();
        this.renderEducation();
        this.renderExperience();
        this.renderSkills();
        this.renderPreferencesForm();
        this.updateProfileSummary();
    }
    renderPersonalForm() {
        const personal = this.profileData.personal;
        
        document.getElementById('firstName').value = personal.firstName;
        document.getElementById('lastName').value = personal.lastName;
        document.getElementById('email').value = personal.email;
        document.getElementById('phone').value = personal.phone;
        document.getElementById('location').value = personal.location;
        document.getElementById('headline').value = personal.headline;
        document.getElementById('summary').value = personal.summary;
    }
    renderEducation() {
        const container = document.getElementById('educationList');
        if (!container) return;

        if (this.profileData.education.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No education added yet.</p>
                </div>
            `;
            return;
        }
        container.innerHTML = this.profileData.education.map(edu => `
            <div class="education-item">
                <div class="item-header">
                    <div>
                        <div class="item-title">${edu.degree}</div>
                        <div class="item-subtitle">${edu.institution}</div>
                        ${edu.field ? `<div class="item-subtitle">${edu.field}</div>` : ''}
                    </div>
                    <div class="item-date">
                        ${this.formatEducationDate(edu.startDate, edu.endDate, edu.currentlyStudying)}
                    </div>
                </div>
                ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
                <div class="item-actions">
                    <button class="btn btn-secondary btn-small" onclick="studentProfile.editEducation('${edu.id}')">
                        Edit
                    </button>
                    <button class="btn btn-primary btn-small" onclick="studentProfile.deleteEducation('${edu.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }
    renderExperience() {
        const container = document.getElementById('experienceList');
        if (!container) return;

        container.innerHTML = '<p>Experience feature coming soon...</p>';
    }
    renderSkills() {
        const container = document.getElementById('skillsList');
        if (!container) return;

        container.innerHTML = this.profileData.skills.map(skill => `
            <div class="skill-tag">
                ${skill}
                <button class="remove-skill" onclick="studentProfile.removeSkill('${skill}')">&times;</button>
            </div>
        `).join('');
    }
    renderPreferencesForm() {
        const prefs = this.profileData.preferences;
        
        document.getElementById('preferredLocation').value = prefs.location;
        document.getElementById('minSalary').value = prefs.minSalary;
        document.getElementById('industries').value = prefs.industries;

        //Set job type checkboxes
        document.querySelectorAll('input[name="jobType"]').forEach(checkbox => {
            checkbox.checked = prefs.jobTypes.includes(checkbox.value);
        });
    }

    updateProfileSummary() {
        const personal = this.profileData.personal;
        document.getElementById('profileName').textContent = `${personal.firstName} ${personal.lastName}`.trim() || 'Your Name';
        document.getElementById('profileTitle').textContent = personal.headline || 'Job Seeker';
    }
    toggleEditMode(section, enable = true) {
        const form = document.getElementById(`${section}Form`);
        const actions = document.getElementById(`${section}Actions`);
        const editBtn = document.getElementById(`edit${section.charAt(0).toUpperCase() + section.slice(1)}Btn`);

        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type !== 'hidden') {
                input.readOnly = !enable;
            }
        });

        //handle checkboxes
        form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.disabled = !enable;
        });
        if (enable) {
            actions.style.display = 'flex';
            editBtn.style.display = 'none';
        } else {
            actions.style.display = 'none';
            editBtn.style.display = 'block';
        }
    }
    async handlePersonalFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        this.profileData.personal = {
            ...this.profileData.personal,
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            phone: formData.get('phone'),
            location: formData.get('location'),
            headline: formData.get('headline'),
            summary: formData.get('summary')
        };
        await this.saveProfile();
        this.toggleEditMode('personal', false);
        this.updateProfileSummary();
        this.showNotification('Personal information updated successfully!', 'success');
    }
    async handlePreferencesFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const jobTypes = [];
        formData.getAll('jobType').forEach(type => jobTypes.push(type));

        this.profileData.preferences = {
            jobTypes,
            location: formData.get('preferredLocation'),
            minSalary: formData.get('minSalary'),
            industries: formData.get('industries')
        };
        await this.saveProfile();
        this.toggleEditMode('preferences', false);
        this.showNotification('Preferences updated successfully!', 'success');
    }
    openEducationModal(education = null) {
        const modal = document.getElementById('educationModal');
        const form = document.getElementById('educationForm');
        
        if (education) {
            //edit mode
            form.dataset.editId = education.id;
            document.getElementById('educationId').value = education.id;
            document.getElementById('institution').value = education.institution;
            document.getElementById('degree').value = education.degree;
            document.getElementById('field').value = education.field || '';
            document.getElementById('startDate').value = education.startDate;
            document.getElementById('endDate').value = education.endDate || '';
            document.getElementById('currentlyStudying').checked = education.currentlyStudying || false;
            document.getElementById('description').value = education.description || '';
            document.getElementById('educationModalTitle').textContent = 'Edit Education';
        } else {
            //Add mode
            form.reset();
            form.dataset.editId = '';
            document.getElementById('educationModalTitle').textContent = 'Add Education';
        }
        
        modal.classList.add('active');
    }

    async handleEducationFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const educationData = {
            id: formData.get('id') || Date.now().toString(),
            institution: formData.get('institution'),
            degree: formData.get('degree'),
            field: formData.get('field'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            currentlyStudying: formData.get('currentlyStudying') === 'on',
            description: formData.get('description')
        };

        if (e.target.dataset.editId) {
            //Update existing education
            const index = this.profileData.education.findIndex(edu => edu.id === e.target.dataset.editId);
            if (index !== -1) {
                this.profileData.education[index] = educationData;
            }
        } else {
            //Add new education
            this.profileData.education.unshift(educationData);
        }
        await this.saveProfile();
        this.renderEducation();
        this.closeEducationModal();
        this.showNotification('Education saved successfully!', 'success');
    }
    closeEducationModal() {
        document.getElementById('educationModal').classList.remove('active');
    }
    editEducation(educationId) {
        const education = this.profileData.education.find(edu => edu.id === educationId);
        if (education) {
            this.openEducationModal(education);
        }
    }
    deleteEducation(educationId) {
        if (confirm('Are you sure you want to delete this education entry?')) {
            this.profileData.education = this.profileData.education.filter(edu => edu.id !== educationId);
            this.saveProfile();
            this.renderEducation();
            this.showNotification('Education deleted successfully!', 'success');
        }
    }
    addSkill() {
        const input = document.getElementById('skillInput');
        const skill = input.value.trim();
        
        if (skill && !this.profileData.skills.includes(skill)) {
            this.profileData.skills.push(skill);
            this.saveProfile();
            this.renderSkills();
            input.value = '';
            this.showNotification('Skill added successfully!', 'success');
        }
    }
    removeSkill(skill) {
        this.profileData.skills = this.profileData.skills.filter(s => s !== skill);
        this.saveProfile();
        this.renderSkills();
        this.showNotification('Skill removed successfully!', 'success');
    }

    uploadProfileImage() {
        //handle file upload
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                //Simulate upload
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById('profileImage').src = event.target.result;
                    this.showNotification('Profile image updated successfully!', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    }
    formatEducationDate(startDate, endDate, currentlyStudying) {
        const start = new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        
        if (currentlyStudying) {
            return `${start} - Present`;
        } else if (endDate) {
            const end = new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            return `${start} - ${end}`;
        } else {
            return `${start} - Present`;
        }
    }
    async saveProfile() {
        localStorage.setItem('studentProfile', JSON.stringify(this.profileData));
    }
    showNotification(message, type = 'info') {
        if (window.careerHub && window.careerHub.showNotification) {
            window.careerHub.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

//Initialize student profile
document.addEventListener('DOMContentLoaded', () => {
    window.studentProfile = new StudentProfile();
});