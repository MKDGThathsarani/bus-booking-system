# Bus Booking System - Internet Technology Coursework

## Project Overview

This is a **complete Bus Booking System** built as a coursework project for the **Internet Technology** module. The system integrates with a **REST API backend** and uses **Bootstrap 5** for a responsive and modern user interface.

## Features Implemented

| Feature | Status |
|---------|--------|
| User Authentication (Login/Logout) | Complete |
| Search Buses by Location & Date | Complete |
| Interactive Seat Selection (Max 5) | Complete |
| Booking Confirmation | Complete |
| Dashboard with Statistics | Complete |
| Booking History | Complete |
| Cancel Bookings | Complete |
| Responsive Design | Complete |
| Error Handling | Complete |
| Session Management | Complete |

## Technology Stack

- **HTML5** - Structure
- **CSS3** - Styling
- **Bootstrap 5** - UI Framework
- **JavaScript (ES6+)** - Logic
- **Fetch API** - HTTP Requests
- **sessionStorage** - Session Management

## Project Structure

Open `index.html` directly in a browser to run the website. The app includes a browser-persisted demo mode, so search, seat selection, bookings, cancellation, and the dashboard work without a backend. If the configured API is reachable, it is still attempted first.

### Demo Accounts

- Admin: `admin` / `admin123`
- Vendor: `vendor` / `vendor123`
- Customer: `customer` / `customer123`

Bookings are stored in `localStorage` under `demoBookings`. Clear that key in browser storage to reset the demo data.
