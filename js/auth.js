// ==========================================
// Authentication Functions
// ==========================================

/**
 * Login user using Bus Booking API
 */
async function loginUser(username, password) {
    // Show loading
    showLoading(true);
    
    // Validate input
    if (!username || !password) {
        showAlert('warning', 'Please enter both username and password');
        showLoading(false);
        return false;
    }
    
    try {
        // Log what we're sending
        console.log('Attempting login with:', { username, password: '***' });
        
        // Try both endpoint variations to handle API inconsistencies
        let response = await apiPost('/BusBooking/login', {
            userName: username,
            password: password
        });
        
        // If login fails due to endpoint not found, try alternative endpoint
        if (!isSuccess(response) && response.message && response.message.includes('404')) {
            console.log('Trying alternative login endpoint...');
            response = await apiPost('/auth/login', {
                userName: username,
                password: password
            });
        }
        
        console.log('Login response:', response);
        
        // Check if response is successful
        if (isSuccess(response)) {
            const userData = getData(response);
            
            // Save user data to sessionStorage
            sessionStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('loginTime', new Date().toISOString());
            
            showAlert('success', `<i class="fas fa-check-circle me-2"></i>Welcome back, ${username}!`);
            
            // Redirect based on role
            const role = userData.role || userData.userType || 'User';
            setTimeout(() => {
                if (role === 'Admin' || role === 'Vendor') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);
            
            return true;
        } else {
            // Login failed - show error message
            const errorMsg = getErrorMessage(response);
            const displayMsg = errorMsg ? `Login failed: ${errorMsg}` : 'Login failed. Please check your credentials and try again.';
            showAlert('danger', displayMsg);
            console.error('Login failed:', errorMsg, response);
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        const errorMsg = error.message || 'Unknown error occurred';
        showAlert('danger', `Login failed: ${errorMsg}. Please check your internet connection and try again.`);
        return false;
    } finally {
        showLoading(false);
    }
}

/**
 * Logout user - Clear session
 */
function logoutUser() {
    sessionStorage.clear();
    showAlert('info', '<i class="fas fa-lock me-2"></i>Logged out successfully');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true';
}

/**
 * Get current user data
 */
function getCurrentUser() {
    const userJson = sessionStorage.getItem('user');
    if (userJson) {
        try {
            return JSON.parse(userJson);
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    }
    return null;
}

/**
 * Get user role
 */
function getUserRole() {
    const user = getCurrentUser();
    return user ? (user.role || user.userType || 'User') : 'Guest';
}

/**
 * Check if user is admin
 */
function isAdmin() {
    const role = getUserRole();
    return role === 'Admin' || role === 'admin';
}

/**
 * Check if user is vendor
 */
function isVendor() {
    const role = getUserRole();
    return role === 'Vendor' || role === 'vendor';
}

/**
 * Require login - Redirect if not logged in
 */
function requireLogin() {
    if (!isLoggedIn()) {
        showAlert('warning', '<i class="fas fa-lock me-2"></i>Please login first');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return false;
    }
    return true;
}

/**
 * Update UI based on login status
 */
function updateUI() {
    const user = getCurrentUser();
    const userDisplay = document.getElementById('userDisplay');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (user && userDisplay) {
        const name = user.userName || user.fullName || user.email || 'User';
        userDisplay.innerHTML = `<i class="fas fa-user me-1"></i>${name}`;
    } else if (userDisplay) {
        userDisplay.innerHTML = `<i class="fas fa-user me-1"></i>Guest`;
    }
    
    if (logoutBtn) {
        logoutBtn.style.display = isLoggedIn() ? 'inline-block' : 'none';
    }
    if (loginBtn) {
        loginBtn.style.display = isLoggedIn() ? 'none' : 'inline-block';
    }
}