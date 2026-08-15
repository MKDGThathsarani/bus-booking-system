// ==========================================
// Bus Search Functions
// ==========================================

/**
 * Search for available buses
 */
async function searchBuses(fromLocation, toLocation, travelDate) {
    showLoading(true, 'searchLoading');
    
    try {
        const endpoint = `/BusBooking/searchBus?fromLocation=${encodeURIComponent(fromLocation)}&toLocation=${encodeURIComponent(toLocation)}&travelDate=${encodeURIComponent(travelDate)}`;
        const response = await apiGet(endpoint);
        
        if (isSuccess(response)) {
            const buses = getData(response) || [];
            displaySearchResults(buses);
            return buses;
        } else {
            showAlert('warning', getErrorMessage(response) || 'No buses found');
            displaySearchResults([]);
            return [];
        }
    } catch (error) {
        console.error('❌ Search error:', error);
        showAlert('danger', 'Failed to search buses');
        return [];
    } finally {
        showLoading(false, 'searchLoading');
    }
}

/**
 * Display search results using Bootstrap cards
 */
function displaySearchResults(buses) {
    const container = document.getElementById('searchResults');
    if (!container) return;
    
    if (!buses || buses.length === 0) {
        container.innerHTML = `
            <div class="alert alert-warning text-center py-5">
                <i class="fas fa-bus fa-3x d-block mb-3 text-muted"></i>
                <h5>🚌 No buses found</h5>
                <p class="mb-0 text-muted">Try different location or date</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="row">
            <div class="col-12">
                <h5 class="mb-3 text-success">
                    <i class="fas fa-route me-2"></i>
                    Available Buses (${buses.length} found)
                </h5>
            </div>
        </div>
        <div class="row">
    `;
    
    buses.forEach((bus) => {
        const availableSeats = bus.totalSeats - (bus.bookedSeats || 0);
        const seatStatus = availableSeats > 5 ? 'success' : (availableSeats > 0 ? 'warning' : 'danger');
        const seatText = availableSeats > 0 ? `${availableSeats} seats` : 'FULL';
        const isAvailable = availableSeats > 0;
        
        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 bus-card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-bus me-2"></i>${bus.busName || 'Bus'}
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <small class="text-muted d-block">
                                    <i class="fas fa-map-marker-alt text-success me-1"></i>From
                                </small>
                                <strong>${bus.fromLocation || 'N/A'}</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block">
                                    <i class="fas fa-map-marker-alt text-danger me-1"></i>To
                                </small>
                                <strong>${bus.toLocation || 'N/A'}</strong>
                            </div>
                        </div>
                        
                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <small class="text-muted d-block">
                                    <i class="fas fa-clock me-1"></i>Departure
                                </small>
                                <strong>${formatDateTime(bus.departureTime)}</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block">
                                    <i class="fas fa-tag me-1"></i>Price
                                </small>
                                <strong class="text-success h5">₹${bus.price || 0}</strong>
                            </div>
                        </div>
                        
                        <hr>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <i class="fas fa-chair me-1"></i>
                                <span class="badge bg-${seatStatus}">${seatText}</span>
                                <small class="text-muted ms-1">/ ${bus.totalSeats || 0}</small>
                            </div>
                            <span class="badge bg-light text-dark">
                                <i class="fas fa-bus me-1"></i>${bus.busVehicleNo || 'N/A'}
                            </span>
                        </div>
                    </div>
                    <div class="card-footer bg-white">
                        <button class="btn btn-${isAvailable ? 'success' : 'secondary'} w-100" 
                                ${isAvailable ? '' : 'disabled'}
                                onclick="openBookingModal(${bus.scheduleId})">
                            ${isAvailable ? '<i class="fas fa-ticket-alt me-2"></i>Book Now' : '<i class="fas fa-times me-2"></i>Fully Booked'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}