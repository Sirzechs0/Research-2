// =====================================
// PCSHS Frontend - Backend Integration
// API Service Module
// =====================================

const API_URL = 'http://localhost:5001/api';

// Store token in localStorage
let authToken = localStorage.getItem('authToken');

// ===== HELPER FUNCTIONS =====

async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            console.error('API Error:', result.message);
        }

        return result;
    } catch (error) {
        console.error('API Call Error:', error);
        return { success: false, message: 'Network error' };
    }
}

// ===== AUTHENTICATION =====

const Auth = {
    register: (email, password, fullName) => 
        apiCall('/auth/register', 'POST', { email, password, fullName }),
    
    login: (email, password) => {
        return apiCall('/auth/login', 'POST', { email, password }).then(result => {
            if (result.success && result.token) {
                authToken = result.token;
                localStorage.setItem('authToken', result.token);
            }
            return result;
        });
    },
    
    getCurrentUser: () => 
        apiCall('/auth/me', 'GET'),
    
    logout: () => {
        authToken = null;
        localStorage.removeItem('authToken');
    }
};

// ===== ANNOUNCEMENTS =====

const Announcements = {
    getAll: () => 
        apiCall('/announcements', 'GET'),
    
    getById: (id) => 
        apiCall(`/announcements/${id}`, 'GET'),
    
    create: (title, content, category) => 
        apiCall('/announcements', 'POST', { title, content, category }),
    
    update: (id, title, content, category) => 
        apiCall(`/announcements/${id}`, 'PUT', { title, content, category }),
    
    delete: (id) => 
        apiCall(`/announcements/${id}`, 'DELETE')
};

// ===== ATTENDANCE =====

const Attendance = {
    get: (userId = null, date = null) => {
        let endpoint = '/attendance';
        if (userId || date) {
            const params = new URLSearchParams();
            if (userId) params.append('userId', userId);
            if (date) params.append('date', date);
            endpoint += '?' + params.toString();
        }
        return apiCall(endpoint, 'GET');
    },
    
    getReport: (date) => 
        apiCall(`/attendance/report?date=${date}`, 'GET'),
    
    record: (userId, date, status, remarks) => 
        apiCall('/attendance', 'POST', { userId, date, status, remarks }),
    
    delete: (id) => 
        apiCall(`/attendance/${id}`, 'DELETE')
};

// ===== LOST & FOUND =====

const LostFound = {
    getAll: (type = null, status = null) => {
        let endpoint = '/lost-found';
        if (type || status) {
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (status) params.append('status', status);
            endpoint += '?' + params.toString();
        }
        return apiCall(endpoint, 'GET');
    },
    
    getById: (id) => 
        apiCall(`/lost-found/${id}`, 'GET'),
    
    post: (title, description, type, location, datePosted, contactInfo) => 
        apiCall('/lost-found', 'POST', { title, description, type, location, datePosted, contactInfo }),
    
    update: (id, status, description) => 
        apiCall(`/lost-found/${id}`, 'PUT', { status, description }),
    
    delete: (id) => 
        apiCall(`/lost-found/${id}`, 'DELETE')
};

// ===== STAFF =====

const Staff = {
    getAll: () => 
        apiCall('/staff', 'GET'),
    
    getById: (id) => 
        apiCall(`/staff/${id}`, 'GET'),
    
    add: (userId, position, department, phone) => 
        apiCall('/staff', 'POST', { userId, position, department, phone }),
    
    update: (id, position, department, phone) => 
        apiCall(`/staff/${id}`, 'PUT', { position, department, phone }),
    
    delete: (id) => 
        apiCall(`/staff/${id}`, 'DELETE')
};

// ===== USER MANAGEMENT (ADMIN) =====

const Users = {
    getAll: () => 
        apiCall('/users/all', 'GET'),
    
    getPending: () => 
        apiCall('/users/pending', 'GET'),
    
    approve: (userId) => 
        apiCall(`/users/approve/${userId}`, 'PUT'),
    
    changeRole: (userId, role) => 
        apiCall(`/users/role/${userId}`, 'PUT', { role }),
    
    delete: (userId) => 
        apiCall(`/users/${userId}`, 'DELETE')
};

// ===== USAGE EXAMPLES =====

/*

// LOGIN
Auth.login('user@example.com', 'password').then(result => {
    if (result.success) {
        console.log('Logged in as:', result.user);
    }
});

// GET ANNOUNCEMENTS
Announcements.getAll().then(result => {
    console.log('Announcements:', result.data);
});

// CREATE ANNOUNCEMENT (ADMIN/STAFF ONLY)
Announcements.create('New Event', 'Details here', 'Event').then(result => {
    console.log('Created:', result.data);
});

// RECORD ATTENDANCE
Attendance.record(1, '2026-05-17', 'Present', 'On time').then(result => {
    console.log('Attendance recorded');
});

// GET LOST & FOUND ITEMS
LostFound.getAll('lost', 'open').then(result => {
    console.log('Lost items:', result.data);
});

// POST LOST ITEM
LostFound.post('Blue Backpack', 'Contains books', 'lost', 'Library', '2026-05-17', '09123456789').then(result => {
    console.log('Posted:', result.data);
});

*/
