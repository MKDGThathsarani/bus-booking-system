// ==========================================
// API Configuration
// ==========================================

// 🔴 IMPORTANT: Change this to your actual API URL
// Get this from your course coordinator or API documentation
// Example: https://freeprojectapi.azurewebsites.net/api
const API_BASE = 'https://your-api-domain.com/api';
const HEADERS = { 'Content-Type': 'application/json' };

// ==========================================
// API Helper Functions
// ==========================================

/**
 * GET request - Fetch data from API
 */
async function apiGet(endpoint) {
    try {
        console.log(`📤 GET: ${API_BASE}${endpoint}`);
        const response = await fetch(API_BASE + endpoint, {
            method: 'GET',
            headers: HEADERS
        });
        const data = await response.json();
        console.log(`📥 GET Response:`, data);
        return data;
    } catch (error) {
        console.error('❌ GET Error:', error);
        return { 
            result: false, 
            message: 'Network error - Please check your connection' 
        };
    }
}

/**
 * POST request - Create new data
 */
async function apiPost(endpoint, body) {
    try {
        console.log(`📤 POST: ${API_BASE}${endpoint}`, body);
        const response = await fetch(API_BASE + endpoint, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(body)
        });
        const data = await response.json();
        console.log(`📥 POST Response:`, data);
        return data;
    } catch (error) {
        console.error('❌ POST Error:', error);
        return { 
            result: false, 
            message: 'Network error - Please check your connection' 
        };
    }
}

/**
 * PUT request - Update existing data
 */
async function apiPut(endpoint, body) {
    try {
        console.log(`📤 PUT: ${API_BASE}${endpoint}`, body);
        const response = await fetch(API_BASE + endpoint, {
            method: 'PUT',
            headers: HEADERS,
            body: JSON.stringify(body)
        });
        const data = await response.json();
        console.log(`📥 PUT Response:`, data);
        return data;
    } catch (error) {
        console.error('❌ PUT Error:', error);
        return { 
            result: false, 
            message: 'Network error - Please check your connection' 
        };
    }
}

/**
 * DELETE request - Delete data
 */
async function apiDelete(endpoint) {
    try {
        console.log(`📤 DELETE: ${API_BASE}${endpoint}`);
        const response = await fetch(API_BASE + endpoint, {
            method: 'DELETE',
            headers: HEADERS
        });
        const data = await response.json();
        console.log(`📥 DELETE Response:`, data);
        return data;
    } catch (error) {
        console.error('❌ DELETE Error:', error);
        return { 
            result: false, 
            message: 'Network error - Please check your connection' 
        };
    }
}

// ==========================================
// Response Helper Functions
// ==========================================

/**
 * Check if API response is successful
 */
function isSuccess(response) {
    return response && response.result === true;
}

/**
 * Get data from API response
 */
function getData(response) {
    return isSuccess(response) ? response.data : null;
}

/**
 * Get error message from API response
 */
function getErrorMessage(response) {
    return response && response.message 
        ? response.message 
        : 'Unknown error occurred';
}

// ==========================================
// UI Helper Functions
// ==========================================

/**
 * Show alert message
 */
function showAlert(type, message) {
    let container = document.getElementById('alertContainer');
    if (!container) {
        const div = document.createElement('div');
        div.id = 'alertContainer';
        div.className = 'container mt-3';
        document.body.prepend(div);
        container = div;
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    container.appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentNode) alert.remove();
    }, 5000);
}

/**
 * Show/hide loading spinner
 */
function showLoading(show, elementId = 'loadingSpinner') {
    const spinner = document.getElementById(elementId);
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
}

/**
 * Format date time for display
 */
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-LK', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format date only for display
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-LK', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}