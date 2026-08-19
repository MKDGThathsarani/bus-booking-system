// ==========================================
// Booking Functions
// ==========================================

let selectedSeats = [];
let currentScheduleId = null;
const MAX_SEATS = 5;

/**
 * Open booking modal with seat selection
 */
async function openBookingModal(scheduleId) {
    if (!requireLogin()) return;
    
    currentScheduleId = scheduleId;
    selectedSeats = [];
    await loadBookedSeats(scheduleId);
    
    const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    modal.show();
}

/**
 * Load booked seats for a schedule
 */
async function loadBookedSeats(scheduleId) {
    try {
        const response = await apiGet(`/BusBooking/getBookedSeats?scheduleId=${scheduleId}`);
        const bookedSeats = isSuccess(response) ? (getData(response) || []) : [];
        renderSeatGrid(bookedSeats);
    } catch (error) {
        console.error('Error loading seats:', error);
        showAlert('danger', 'Failed to load seat availability');
    }
}

/**
 * Render seat grid
 */
function renderSeatGrid(bookedSeats) {
    const grid = document.getElementById('seatGrid');
    if (!grid) return;
    
    let html = '<div class="row g-2">';
    for (let i = 1; i <= 20; i++) {
        const isBooked = bookedSeats.includes(i);
        const isSelected = selectedSeats.includes(i);
        
        let btnClass = 'btn-outline-secondary';
        let btnText = i;
        
        if (isBooked) {
            btnClass = 'btn-secondary booked';
            btnText = `<i class="fas fa-times"></i>`;
        } else if (isSelected) {
            btnClass = 'btn-success selected';
            btnText = `<i class="fas fa-check"></i>`;
        } else {
            btnClass = 'btn-outline-success';
        }
        
        html += `
            <div class="col-2">
                <button class="btn ${btnClass} w-100 seat-btn" 
                        data-seat="${i}"
                        ${isBooked ? 'disabled' : ''}
                        onclick="toggleSeat(${i})">
                    ${btnText}
                </button>
            </div>
        `;
        if (i === 10) html += `<div class="col-2"></div>`;
    }
    html += '</div>';
    grid.innerHTML = html;
    updateSelectedCount();
}

/**
 * Toggle seat selection
 */
function toggleSeat(seatNumber) {
    const index = selectedSeats.indexOf(seatNumber);
    if (index > -1) {
        selectedSeats.splice(index, 1);
    } else {
        if (selectedSeats.length >= MAX_SEATS) {
            showAlert('warning', `<i class="fas fa-exclamation-triangle me-2"></i>Maximum ${MAX_SEATS} seats per booking`);
            return;
        }
        selectedSeats.push(seatNumber);
    }
    updateSeatUI();
    updateSelectedCount();
}

/**
 * Update seat UI after selection
 */
function updateSeatUI() {
    document.querySelectorAll('.seat-btn').forEach(btn => {
        const seat = parseInt(btn.dataset.seat);
        if (!btn.disabled) {
            if (selectedSeats.includes(seat)) {
                btn.className = 'btn btn-success w-100 seat-btn selected';
                btn.innerHTML = `<i class="fas fa-check"></i>`;
            } else {
                btn.className = 'btn btn-outline-success w-100 seat-btn';
                btn.innerHTML = seat;
            }
        }
    });
}

/**
 * Update selected seats count
 */
function updateSelectedCount() {
    const count = document.getElementById('selectedCount');
    if (count) {
        count.textContent = selectedSeats.length;
    }
}

/**
 * Confirm booking
 */
async function confirmBooking() {
    if (selectedSeats.length === 0) {
        showAlert('warning', '<i class="fas fa-exclamation-triangle me-2"></i>Please select at least one seat');
        return;
    }
    
    const user = getCurrentUser();
    if (!user) {
        showAlert('warning', 'Please login first');
        return;
    }
    
    const passengerName = document.getElementById('passengerName').value.trim() || 'Guest';
    const passengerAge = parseInt(document.getElementById('passengerAge').value) || 0;
    const passengerGender = document.getElementById('passengerGender').value || 'Male';
    
    const passengers = selectedSeats.map(seat => ({
        passengerName: passengerName,
        age: passengerAge,
        gender: passengerGender,
        seatNo: seat
    }));
    
    const bookingData = {
        custId: user.userId || user.customerId || 1,
        bookingDate: new Date().toISOString(),
        scheduleId: currentScheduleId,
        busBookingPassenger: passengers
    };
    
    showLoading(true);
    
    try {
        const response = await apiPost('/BusBooking/PostBusBooking', bookingData);
        
        if (isSuccess(response)) {
            showAlert('success', `<i class="fas fa-ticket-alt me-2"></i>Booking confirmed! ${selectedSeats.length} seat(s) booked.`);
            const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
            if (modal) modal.hide();
            selectedSeats = [];
            document.getElementById('searchForm').dispatchEvent(new Event('submit'));
        } else {
            showAlert('danger', getErrorMessage(response) || 'Booking failed');
        }
    } catch (error) {
        console.error('Booking error:', error);
        showAlert('danger', 'Failed to complete booking');
    } finally {
        showLoading(false);
    }
}

/**
 * Cancel booking
 */
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    showLoading(true);
    try {
        const response = await apiDelete(`/BusBooking/DeleteBusBooking?bookingId=${bookingId}`);
        if (isSuccess(response)) {
            showAlert('success', '<i class="fas fa-check-circle me-2"></i>Booking cancelled successfully');
            if (typeof loadDashboard === 'function') {
                loadDashboard();
            }
        } else {
            showAlert('danger', getErrorMessage(response) || 'Failed to cancel booking');
        }
    } catch (error) {
        console.error('Cancel error:', error);
        showAlert('danger', 'Failed to cancel booking');
    } finally {
        showLoading(false);
    }
}