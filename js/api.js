// ==========================================
// API Configuration
// ==========================================

// IMPORTANT: ඔබගේ ACTUAL API URL එක මෙතන දාන්න
// ඔබගේ lecturer ගෙන් හෝ API documentation එකෙන් මෙය ලබා ගන්න
const API_BASE = 'https://freeprojectapi.azurewebsites.net/api';
const HEADERS = { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

const DEMO_BUSES = [
    { scheduleId: 101, busName: 'Lanka Express', busVehicleNo: 'NB-4587', fromLocation: 'Colombo', toLocation: 'Kandy', departureTime: '2026-09-03T06:30:00', arrivalTime: '2026-09-03T10:15:00', price: 1450, totalSeats: 20, bookedSeats: 6 },
    { scheduleId: 102, busName: 'Hill Country Coach', busVehicleNo: 'NC-2190', fromLocation: 'Colombo', toLocation: 'Kandy', departureTime: '2026-09-03T09:00:00', arrivalTime: '2026-09-03T12:45:00', price: 1750, totalSeats: 20, bookedSeats: 3 },
    { scheduleId: 103, busName: 'Southern Star', busVehicleNo: 'ND-8812', fromLocation: 'Colombo', toLocation: 'Galle', departureTime: '2026-09-03T07:15:00', arrivalTime: '2026-09-03T09:45:00', price: 1100, totalSeats: 20, bookedSeats: 8 },
    { scheduleId: 104, busName: 'Coastal Rider', busVehicleNo: 'NE-3071', fromLocation: 'Colombo', toLocation: 'Galle', departureTime: '2026-09-03T14:30:00', arrivalTime: '2026-09-03T17:00:00', price: 950, totalSeats: 20, bookedSeats: 2 },
    { scheduleId: 105, busName: 'Northbound', busVehicleNo: 'NF-6402', fromLocation: 'Kandy', toLocation: 'Jaffna', departureTime: '2026-09-03T05:45:00', arrivalTime: '2026-09-03T15:30:00', price: 2850, totalSeats: 20, bookedSeats: 11 },
    { scheduleId: 106, busName: 'Heritage Line', busVehicleNo: 'NG-1108', fromLocation: 'Galle', toLocation: 'Colombo', departureTime: '2026-09-03T16:00:00', arrivalTime: '2026-09-03T18:30:00', price: 1100, totalSeats: 20, bookedSeats: 4 }
];

function getDemoBookings() {
    try { return JSON.parse(localStorage.getItem('demoBookings') || '[]'); } catch (error) { return []; }
}

function saveDemoBookings(bookings) {
    localStorage.setItem('demoBookings', JSON.stringify(bookings));
}

function getDemoBookedSeats(scheduleId) {
    const baseBookedSeats = Array.from({ length: DEMO_BUSES.find(bus => bus.scheduleId === Number(scheduleId))?.bookedSeats || 0 }, (_, index) => index + 1);
    return baseBookedSeats.concat(getDemoBookings()
        .filter(booking => booking.scheduleId === Number(scheduleId) && booking.status !== 'Cancelled')
        .flatMap(booking => (booking.busBookingPassenger || []).map(passenger => passenger.seatNo)));
}

function getDemoResponse(endpoint, body) {
    if (endpoint.includes('searchBus')) {
        const params = new URLSearchParams(endpoint.split('?')[1]);
        const buses = DEMO_BUSES.filter(bus => bus.fromLocation === params.get('fromLocation') && bus.toLocation === params.get('toLocation'));
        return { result: true, data: buses };
    }
    if (endpoint.includes('getBookedSeats')) return { result: true, data: getDemoBookedSeats(new URLSearchParams(endpoint.split('?')[1]).get('scheduleId')) };
    if (endpoint.includes('GetAllBusBookings')) return { result: true, data: getDemoBookings() };
    if (endpoint.includes('PostBusBooking')) {
        const bookings = getDemoBookings();
        const booking = { ...body, bookingId: Date.now(), status: 'Confirmed', customerName: getCurrentUser()?.fullName || getCurrentUser()?.userName || 'Demo customer', totalAmount: body.busBookingPassenger.length * (DEMO_BUSES.find(bus => bus.scheduleId === Number(body.scheduleId))?.price || 0) };
        bookings.unshift(booking);
        saveDemoBookings(bookings);
        return { result: true, data: booking };
    }
    if (endpoint.includes('DeleteBusBooking')) {
        const bookingId = Number(new URLSearchParams(endpoint.split('?')[1]).get('bookingId'));
        saveDemoBookings(getDemoBookings().map(booking => booking.bookingId === bookingId ? { ...booking, status: 'Cancelled' } : booking));
        return { result: true, data: true };
    }
    return { result: false, message: 'Demo data unavailable' };
}

// ==========================================
// API Helper Functions with Better Error Handling
// ==========================================

/**
 * GET request - Fetch data from API
 */
async function apiGet(endpoint) {
    try {
        console.log(`GET: ${API_BASE}${endpoint}`);
        
        const response = await fetch(API_BASE + endpoint, {
            method: 'GET',
            headers: HEADERS,
            mode: 'cors',
            credentials: 'include'
        });
        
        // Check if response is OK
        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            return getDemoResponse(endpoint);
        }
        
        const data = await response.json();
        console.log(`GET Response:`, data);
        return data;
        
    } catch (error) {
        console.error('Network Error:', error);
        
        return getDemoResponse(endpoint);
    }
}

/**
 * POST request - Create new data
 */
async function apiPost(endpoint, body) {
    try {
        console.log(`POST: ${API_BASE}${endpoint}`, body);
        
        const response = await fetch(API_BASE + endpoint, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(body),
            mode: 'cors',
            credentials: 'include'
        });
        
        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            return getDemoResponse(endpoint, body);
        }
        
        const data = await response.json();
        console.log(`POST Response:`, data);
        return data;
        
    } catch (error) {
        console.error('Network Error:', error);
        
        return getDemoResponse(endpoint, body);
    }
}

/**
 * PUT request - Update existing data
 */
async function apiPut(endpoint, body) {
    try {
        console.log(`PUT: ${API_BASE}${endpoint}`, body);
        
        const response = await fetch(API_BASE + endpoint, {
            method: 'PUT',
            headers: HEADERS,
            body: JSON.stringify(body),
            mode: 'cors',
            credentials: 'include'
        });
        
        if (!response.ok) {
                return getDemoResponse(endpoint, body);
        }
        
        const data = await response.json();
        console.log(`PUT Response:`, data);
        return data;
        
    } catch (error) {
        console.error('Network Error:', error);
        return getDemoResponse(endpoint, body);
    }
}

/**
 * DELETE request - Delete data
 */
async function apiDelete(endpoint) {
    try {
        console.log(`DELETE: ${API_BASE}${endpoint}`);
        
        const response = await fetch(API_BASE + endpoint, {
            method: 'DELETE',
            headers: HEADERS,
            mode: 'cors',
            credentials: 'include'
        });
        
        if (!response.ok) {
                return getDemoResponse(endpoint);
        }
        
        const data = await response.json();
        console.log(`DELETE Response:`, data);
        return data;
        
    } catch (error) {
        console.error('Network Error:', error);
        return getDemoResponse(endpoint);
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