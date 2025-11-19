
class ApiService {
    constructor() {
        this.baseURL = 'https://api.careerhub.com/v1';
        this.token = localStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
                ...options.headers
            },
            ...options
        };
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    //Authentication endpoints
    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }

    //Applications endpoints
    async getApplications(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/applications?${queryParams}`);
    }
    async createApplication(applicationData) {
        return this.request('/applications', {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
    }

    async updateApplication(id, applicationData) {
        return this.request(`/applications/${id}`, {
            method: 'PUT',
            body: JSON.stringify(applicationData)
        });
    }

    async deleteApplication(id) {
        return this.request(`/applications/${id}`, {
            method: 'DELETE'
        });
    }

    // Profile endpoints
    async getProfile(userId) {
        return this.request(`/profile/${userId}`);
    }

    async updateProfile(userId, profileData) {
        return this.request(`/profile/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    //Jobs endpoints
    async searchJobs(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/jobs?${queryParams}`);
    }
    async getJobDetails(jobId) {
        return this.request(`/jobs/${jobId}`);
    }
    //companies endpoints
    async getCompanies(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/companies?${queryParams}`);
    }
    async getCompanyDetails(companyId) {
        return this.request(`/companies/${companyId}`);
    }

    async uploadFile(file, type = 'document') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        return this.request('/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });
    }

    //Mock data for development
    async getMockData(endpoint) {
        //Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockData = {
            '/applications': [
                {
                    id: '1',
                    jobTitle: 'Frontend Developer',
                    companyName: 'TechCorp Inc.',
                    status: 'interview',
                    applicationDate: '2024-01-15'
                }
            ],
            '/profile': {
                personal: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com'
                }
            }
        };

        return mockData[endpoint] || [];
    }
}
//create global API instance
window.apiService = new ApiService();