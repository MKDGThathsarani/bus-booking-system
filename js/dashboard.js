// ==========================================
// Dashboard Functions
// ==========================================

/**
 * Load dashboard for vendor/admin
 */
async function loadDashboard() {
    const user = getCurrentUser();
    if (!user) {
        showAlert('warning', 'Please login to view dashboard');
        return;
    }
    
    const userId = user.userId || user.id;
    const isVendorUser = isVendor() || isAdmin();
    
    if (!isVendorUser) {
        document.getElementById('dashboardContent').innerHTML = `
            <div class="alert alert-info text-center py-5">
                <i class="fas fa-user fa-3x d-block mb-3 text-primary"></i>
                <h5><i class="fas fa-user me-2"></i>Customer Dashboard</h5>
                <p class="text-muted">Your booking history will appear here.</p>
            </div>
        `;
        return;
    }
    
    await loadVendorDashboard(userId);
}

/**
 * Load vendor dashboard
 */
async function loadVendorDashboard(vendorId) {
    const container = document.getElementById('dashboardContent');
    
    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-3 text-muted">Loading dashboard...</p>
        </div>
    `;
    
    try {
        const response = await apiGet(`/BusBooking/GetAllBusBookings?vendorId=${vendorId}`);
        
        if (!isSuccess(response)) {
            container.innerHTML = `
                <div class="alert alert-warning text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x d-block mb-3"></i>
                    <h5>No Data Available</h5>
                    <p class="text-muted">${getErrorMessage(response) || 'No bookings found'}</p>
                </div>
            `;
            return;
        }
        
        const bookings = getData(response) || [];
        renderDashboardStats(bookings);
        
    } catch (error) {
        console.error('Dashboard error:', error);
        container.innerHTML = `
            <div class="alert alert-danger text-center py-5">
                <i class="fas fa-times-circle fa-3x d-block mb-3"></i>
                <h5>Failed to Load Dashboard</h5>
                <p class="text-muted">Please try again later</p>
            </div>
        `;
    }
}

/**
 * Render dashboard statistics
 */
function renderDashboardStats(bookings) {
    const container = document.getElementById('dashboardContent');
    if (!container) return;
    
    if (!bookings || bookings.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info text-center py-5">
                <i class="fas fa-chart-bar fa-3x d-block mb-3 text-muted"></i>
                <h5><i class="fas fa-chart-bar me-2"></i>No bookings yet</h5>
                <p class="text-muted">Start selling tickets! Create bus schedules and bookings will appear here.</p>
                <a href="index.html" class="btn btn-primary mt-3">
                    <i class="fas fa-plus me-2"></i>Create Schedule
                </a>
            </div>
        `;
        return;
    }
    
    const stats = calculateStats(bookings);
    
    container.innerHTML = `
        <div class="row g-3 mb-4">
            <div class="col-md-3 col-6">
                <div class="stat-card">
                    <span class="stat-icon"><i class="fas fa-clipboard-list"></i></span>
                    <div class="stat-number">${stats.totalBookings}</div>
                    <div class="stat-label">Total Bookings</div>
                </div>
            </div>
            <div class="col-md-3 col-6">
                <div class="stat-card-secondary">
                    <span class="stat-icon"><i class="fas fa-user"></i></span>
                    <div class="stat-number">${stats.totalPassengers}</div>
                    <div class="stat-label">Total Passengers</div>
                </div>
            </div>
            <div class="col-md-3 col-6">
                <div class="stat-card">
                    <span class="stat-icon"><i class="fas fa-calendar-alt"></i></span>
                    <div class="stat-number">${stats.todayBookings}</div>
                    <div class="stat-label">Today's Bookings</div>
                </div>
            </div>
            <div class="col-md-3 col-6">
                <div class="stat-card-secondary">
                    <span class="stat-icon"><i class="fas fa-coins"></i></span>
                    <div class="stat-number">₹${stats.totalRevenue.toFixed(2)}</div>
                    <div class="stat-label">Total Revenue</div>
                </div>
            </div>
        </div>
        
        <div class="card shadow-sm mb-4">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-chart-line me-2"></i>Weekly Bookings
                </h5>
            </div>
            <div class="card-body">
                ${renderWeeklyStats(bookings)}
            </div>
        </div>
        
        <div class="card shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-list me-2"></i>Recent Bookings
                </h5>
                <span class="badge bg-primary">${bookings.length} total</span>
            </div>
            <div class="card-body p-0">
                ${renderBookingsTable(bookings.slice(0, 10))}
            </div>
        </div>
    `;
}

/**
 * Calculate statistics from bookings
 */
function calculateStats(bookings) {
    const today = new Date().toDateString();
    
    let totalBookings = bookings.length;
    let totalPassengers = 0;
    let totalRevenue = 0;
    let todayBookings = 0;
    
    bookings.forEach(booking => {
        const passengers = booking.busBookingPassenger || [];
        totalPassengers += passengers.length;
        totalRevenue += booking.totalAmount || 0;
        
        const bookingDate = new Date(booking.bookingDate);
        if (bookingDate.toDateString() === today) {
            todayBookings++;
        }
    });
    
    return { totalBookings, totalPassengers, totalRevenue, todayBookings };
}

/**
 * Render weekly statistics as progress bars
 */
function renderWeeklyStats(bookings) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toDateString());
    }
    
    const dayCounts = days.map(day => {
        return bookings.filter(b => {
            const bDate = new Date(b.bookingDate);
            return bDate.toDateString() === day;
        }).length;
    });
    
    const maxCount = Math.max(...dayCounts, 1);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return days.map((day, index) => {
        const count = dayCounts[index];
        const percentage = (count / maxCount) * 100;
        const dayName = dayNames[new Date(day).getDay()];
        const dateNum = new Date(day).getDate();
        
        return `
            <div class="mb-2">
                <div class="d-flex justify-content-between">
                    <small><strong>${dayName}</strong> ${dateNum}</small>
                    <small>${count} booking${count !== 1 ? 's' : ''}</small>
                </div>
                <div class="progress">
                    <div class="progress-bar" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render bookings table
 */
function renderBookingsTable(bookings) {
    if (!bookings || bookings.length === 0) {
        return `
            <div class="text-center py-4 text-muted">
                <i class="fas fa-inbox fa-2x d-block mb-2"></i>
                No bookings to display
            </div>
        `;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th><i class="fas fa-hashtag me-1"></i>ID</th>
                        <th><i class="fas fa-user me-1"></i>Customer</th>
                        <th><i class="fas fa-users me-1"></i>Passengers</th>
                        <th><i class="fas fa-rupee-sign me-1"></i>Amount</th>
                        <th><i class="fas fa-calendar me-1"></i>Date</th>
                        <th><i class="fas fa-info-circle me-1"></i>Status</th>
                        <th><i class="fas fa-cog me-1"></i>Action</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    bookings.forEach(booking => {
        const passengers = booking.busBookingPassenger || [];
        const status = booking.status || 'Confirmed';
        const statusClass = status === 'Confirmed' ? 'success' : 
                           status === 'Cancelled' ? 'danger' : 'warning';
        const isCancelled = status === 'Cancelled';
        
        html += `
            <tr>
                <td><strong>#${booking.bookingId || 'N/A'}</strong></td>
                <td>
                    <strong>${booking.customerName || 'N/A'}</strong>
                    <br>
                    <small class="text-muted">${booking.customerEmail || ''}</small>
                </td>
                <td>
                    <span class="badge bg-info">${passengers.length}</span>
                    <br>
                    <small class="text-muted">Seats: ${passengers.map(p => p.seatNo).join(', ')}</small>
                </td>
                <td>
                    <strong class="text-success">₹${(booking.totalAmount || 0).toFixed(2)}</strong>
                </td>
                <td>
                    ${formatDate(booking.bookingDate)}
                    <br>
                    <small class="text-muted">${new Date(booking.bookingDate).toLocaleTimeString()}</small>
                </td>
                <td>
                    <span class="badge bg-${statusClass}">${status}</span>
                </td>
                <td>
                    ${!isCancelled ? `
                        <button class="btn btn-sm btn-danger" onclick="cancelBooking(${booking.bookingId})">
                            <i class="fas fa-times me-1"></i>Cancel
                        </button>
                    ` : `
                        <span class="text-muted"><i class="fas fa-check-circle text-success me-1"></i>Cancelled</span>
                    `}
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}