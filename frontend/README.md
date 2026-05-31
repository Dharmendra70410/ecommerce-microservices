# Distributed Commerce Frontend

A React.js frontend application for a distributed e-commerce system with role-based access control and real-time admin dashboards.

## Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.jsx      # Navigation component with role-based menu
│   │   └── KPICard.jsx     # Key Performance Indicator card component
│   │
│   ├── contexts/           # Global state management
│   │   └── AuthContext.jsx # Authentication context (isAuthenticated, user, login, logout, signup)
│   │
│   ├── middleware/         # Route protection components
│   │   ├── ProtectedRoute.jsx  # Protects routes for authenticated users only
│   │   └── AdminRoute.jsx      # Protects routes for admin users only
│   │
│   ├── pages/              # Page components
│   │   ├── Login.jsx       # Login page with demo credentials
│   │   ├── Signup.jsx      # User registration page
│   │   ├── Home.jsx        # Home page for regular users
│   │   ├── DashboardPage.jsx   # Admin control room dashboard
│   │   ├── OrdersPage.jsx      # Order tracking and management
│   │   ├── HealthPage.jsx      # System health monitoring
│   │   └── LogsPage.jsx        # System logs viewer
│   │
│   ├── services/           # API calls
│   │   └── api.js          # Axios instance and API functions
│   │
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # React entry point
│   ├── styles.css          # Global styles (dark theme)
│   │
│   └── vite.config.js      # Vite configuration
│
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Authentication & Authorization

### Global Auth State (Context)

The `AuthContext` stores and manages:
- `isAuthenticated` (boolean)
- `user` (object with `id`, `username`, `email`, `role`)
- `loading` (boolean)

### Demo Users

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`
- Role: `admin`

**Regular User:**
- Email: `user@example.com`
- Password: `user123`
- Role: `user`

### Route Protection

#### ProtectedRoute
Requires user to be authenticated. Redirects to `/login` if not.

```jsx
<Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
```

#### AdminRoute
Requires user to be authenticated AND have admin role. Redirects to `/` if not admin.

```jsx
<Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
```

## Routing Structure

### Public Routes
- `/login` - Login page
- `/signup` - Registration page

### Protected Routes
- `/` - Home page (redirects to admin dashboard if user is admin)

### Admin Routes
- `/admin` - Admin dashboard with KPI cards and charts
- `/admin/orders` - Order tracking and search
- `/admin/system-health` - Service health status
- `/admin/logs` - System logs viewer

## Pages Overview

### Login & Signup
- Form-based authentication
- Demo credentials displayed for testing
- Email and password validation
- Stores auth state in localStorage

### Home Page (User)
- Welcome message with user's name
- Browse products section
- Track orders section
- System status section
- How it works information

### Dashboard (Admin)
- **Operations Snapshot** KPI cards:
  - Total Orders
  - Paid Orders
  - Pending Orders
  - Failed Orders
- **Orders Over Last 7 Days** chart (Area chart)
- Real-time gateway status display

### Orders Page (Admin)
- Search functionality (by Order ID, User ID, Status)
- Sortable table with order details
- Status badges (Paid, Pending, Failed)
- Real-time order updates

### System Health Page (Admin)
- Service health status grid
- Services monitored:
  - API Gateway
  - Order Service
  - Inventory Service
  - Payment Worker
  - Redis
- Color-coded health indicators

### Logs Page (Admin)
- Real-time system logs viewer
- Displays timestamp, level, and message
- Recent system events from gateway and workers

## Component Hierarchy

```
App
├── Router
├── AuthProvider
├── Navbar
│   ├── Links (Admin/User specific)
│   ├── User Info
│   └── Logout Button
└── Routes
    ├── Login
    ├── Signup
    └── ProtectedRoute/AdminRoute
        └── Pages
```

## API Integration

The `api.js` service provides:
- `getOrders()` - Fetch all orders
- `getSystemHealth()` - Get system status
- `getLogs()` - Fetch system logs
- `getGatewayBaseUrl()` - Get API gateway URL

### Environment Variables

Create a `.env` file:
```
VITE_API_GATEWAY_URL=http://GATEWAY_MACHINE_IP:8080
VITE_API_TIMEOUT_MS=15000
```

For cross-machine usage, replace `GATEWAY_MACHINE_IP` with your friend's gateway node IP (same LAN/VPN reachable address).
Example:
```
VITE_API_GATEWAY_URL=http://192.168.1.50:8080
```

## Styling

- **Theme**: Dark theme with orange accent color
- **Colors**:
  - Background: `#11120d` to `#1e2018`
  - Accent: `#ff8b3d` (orange)
  - Success: `#56d364` (green)
  - Warning: `#ffb703` (yellow)
  - Error: `#f85757` (red)
- **Font**: Space Grotesk for headings, monospace for code

## Setup & Running

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Dependencies

- **react** ^19.2.4 - UI framework
- **react-router-dom** ^7.14.0 - Routing
- **axios** ^1.14.0 - HTTP client
- **recharts** ^3.8.1 - Charting library
- **vite** ^8.0.7 - Build tool

## Features

✅ Context-based global authentication
✅ Role-based access control (Admin/User)
✅ Protected and admin-only routes
✅ Dark theme UI
✅ Real-time admin dashboards
✅ Order tracking and search
✅ System health monitoring
✅ Live logs viewer
✅ Responsive design
✅ LocalStorage persistence
✅ Demo credentials for testing

## Usage Flow

1. **First Visit**: User is redirected to login
2. **Login**: Use demo credentials or existing account
3. **For Admin Users**: Dashboard with full access to all admin features
4. **For Regular Users**: Home page with product browsing options
5. **Logout**: Clears all auth state and returns to login

## Development Tips

- Auth state persists across page refreshes via localStorage
- All routes are protected/controlled by context state
- API calls are handled by the `api.js` service
- Charts and tables use recharts for visualization
- Responsive CSS Grid layout adapts to all screen sizes

## File Naming Conventions

- Page components: `PascalCase.jsx` in `pages/`
- Utility components: `PascalCase.jsx` in `components/`
- Contexts: `PascalCase.jsx` in `contexts/`
- Services: `camelCase.js` in `services/`

## Notes

- This is a frontend-only application and requires a backend API
- Demo authentication does not connect to a real backend (can be easily integrated)
- All API responses are mocked for demo purposes
- Extend `api.js` to connect to your actual backend

## Future Enhancements

- Real backend API integration
- Database persistence
- WebSocket for real-time updates
- User profile management
- Order history
- Payment integration
- Notifications system
- Advanced filtering and sorting
- Export functionality
