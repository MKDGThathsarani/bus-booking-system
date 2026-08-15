// ==========================================
// Authentication Functions
// ==========================================

/**
 * Login user using Bus Booking API
 */
async function loginUser(username, password) {
    showLoading(true);
    
    try {
        const response = await apiPost('/BusBooking/login', {
            userName: username,
            password: password
        });
        
        if (isSuccess(response)) {
            const userData = getData(response);
            
            // Save user data to sessionStorage
            sessionStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('loginTime', new Date().toISOString());
            
            showAlert('success', `Welcome back, ${username}! 🎉`);
            console.log('✅ Login successful:', userData);
            
            // Redirect based on role
            const role = userData.role || userData.userType || 'User';
            if (role === 'Admin' || role === 'Vendor') {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'index.html';
            }
            return true;
        } else {
            const errorMsg = getErrorMessage(response);
            showAlert('danger', `Login failed: ${errorMsg} ❌`);
            console.error('❌ Login failed:', errorMsg);
            return false;
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        showAlert('danger', 'Login failed. Please try again.');
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
    showAlert('info', 'Logged out successfully 🔒');
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
            console.error('❌ Error parsing user data:', e);
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
 * Check if user has specific role
 */
function hasRole(roles) {
    const userRole = getUserRole();
    if (Array.isArray(roles)) {
        return roles.includes(userRole);
    }
    return userRole === roles;
}

/**
 * Require login - Redirect if not logged in
 */
function requireLogin() {
    if (!isLoggedIn()) {
        showAlert('warning', 'Please login first 🔐');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return false;
    }
    return true;
}

/**
 * Require admin - Redirect if not admin
 */
function requireAdmin() {
    if (!requireLogin()) return false;
    if (!isAdmin()) {
        showAlert('danger', 'Access denied. Admin only ⛔');
        setTimeout(() => {
            window.location.href = 'index.html';
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