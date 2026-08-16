// ==========================================
// API Configuration
// ==========================================

// 🔴 IMPORTANT: ඔබගේ ACTUAL API URL එක මෙතන දාන්න
// ඔබගේ lecturer ගෙන් හෝ API documentation එකෙන් මෙය ලබා ගන්න
const API_BASE = 'https://freeprojectapi.azurewebsites.net/api';
const HEADERS = { 'Content-Type': 'application/json' };

// ==========================================
// API Helper Functions with Better Error Handling
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
        
        // Check if response is OK
        if (!response.ok) {
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            return { 
                result: false, 
                message: `Server error: ${response.status} ${response.statusText}` 
            };
        }
        
        const data = await response.json();
        console.log(`📥 GET Response:`, data);
        return data;
        
    } catch (error) {
        console.error('❌ Network Error:', error);
        
        // More specific error messages
        let errorMessage = 'Network error - Please check your connection';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to server. Please check if API is running.';
        } else if (error.message.includes('NetworkError')) {
            errorMessage = 'Network error. Please check your internet connection.';
        }
        
        return { 
            result: false, 
            message: errorMessage 
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
        
        if (!response.ok) {
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            return { 
                result: false, 
                message: `Server error: ${response.status} ${response.statusText}` 
            };
        }
        
        const data = await response.json();
        console.log(`📥 POST Response:`, data);
        return data;
        
    } catch (error) {
        console.error('❌ Network Error:', error);
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
        
        if (!response.ok) {
            return { 
                result: false, 
                message: `Server error: ${response.status} ${response.statusText}` 
            };
        }
        
        const data = await response.json();
        console.log(`📥 PUT Response:`, data);
        return data;
        
    } catch (error) {
        console.error('❌ Network Error:', error);
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
        
        if (!response.ok) {
            return { 
                result: false, 
                message: `Server error: ${response.status} ${response.statusText}` 
            };
        }
        
        const data = await response.json();
        console.log(`📥 DELETE Response:`, data);
        return data;
        
    } catch (error) {
        console.error('❌ Network Error:', error);
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
    if (!response) return 'Unknown error occurred';
    if (response.message) return response.message;
    return 'Unknown error occurred';
}

// ==========================================
// UI Helper Functions
// ==========================================

/**
 * Show alert message
 */
function showAlert(type, message) {
    // Find or create alert container
    let container = document.getElementById('alertContainer');
    if (!container) {
        const div = document.createElement('div');
        div.id = 'alertContainer';
        div.className = 'container mt-3';
        document.body.prepend(div);
        container = div;
    }
    
    // Create alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    
    // Get icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    else if (type === 'danger') icon = 'exclamation-circle';
    else if (type === 'warning') icon = 'exclamation-triangle';
    
    alert.innerHTML = `
        <i class="fas fa-${icon} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.appendChild(alert);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
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