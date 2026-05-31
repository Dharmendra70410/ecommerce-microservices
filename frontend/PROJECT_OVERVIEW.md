# 🏗️ Distributed Commerce Frontend - Complete Project Overview

## ✨ What's Included

Your complete React.js frontend for a distributed e-commerce system with:

### 🔐 Authentication System
- **Global Auth Context**: Central state management for user authentication
- **Login Page**: Demo credentials built-in for testing
- **Signup Page**: User registration with validation
- **Route Protection**: Automatic route guarding based on auth status
- **Role-Based Access**: Different views for admin and regular users

### 📊 Admin Dashboard
- **Control Room Interface**: Professional dark-themed dashboard
- **Operations Snapshot**: Real-time KPI cards (Total Orders, Paid, Pending, Failed)
- **Analytics Chart**: Orders over last 7 days (Area chart)
- **Responsive Design**: Works on desktop, tablet, and mobile

### 📋 Admin Pages (Restricted to admin users)
1. **Dashboard** (`/admin`) - Overview with KPIs and charts
2. **Orders** (`/admin/orders`) - Search and track orders
3. **System Health** (`/admin/system-health`) - Monitor service health
4. **Logs** (`/admin/logs`) - View system events and logs

### 👤 User Pages
1. **Home** (`/`) - Welcome page with product browsing options
2. **Login** (`/login`) - Authentication entry point
3. **Signup** (`/signup`) - Registration for new users

### 🎨 UI Components
- **Navbar**: Dynamic navigation with role-based menu
- **KPI Cards**: Reusable metric display components
- **Charts**: Interactive area charts (via Recharts)
- **Tables**: Order tracking with search
- **Health Grid**: Service status indicators

---

## 📁 Complete File Structure

```
frontend/
│
├── public/
│   └── index.html
│
├── src/
│   │
│   ├── components/              [REUSABLE UI COMPONENTS]
│   │   ├── Navbar.jsx           - Navigation with role-based menu
│   │   └── KPICard.jsx          - Metric display component
│   │
│   ├── contexts/                [GLOBAL STATE MANAGEMENT]
│   │   └── AuthContext.jsx      - Authentication state & functions
│   │                             (isAuthenticated, user, login, logout, signup)
│   │
│   ├── middleware/              [ROUTE PROTECTION]
│   │   ├── ProtectedRoute.jsx   - Guards for authenticated users
│   │   ├── AdminRoute.jsx       - Guards for admin-only routes
│   │   ├── userMiddleware.js    - Backend middleware (not used in frontend)
│   │   └── adminMiddleware.js   - Backend middleware (not used in frontend)
│   │
│   ├── pages/                   [PAGE COMPONENTS]
│   │   ├── Login.jsx            ← /login → Username/password form
│   │   ├── Signup.jsx           ← /signup → User registration
│   │   ├── Home.jsx             ← / (users) → Home dashboard
│   │   ├── DashboardPage.jsx    ← /admin (admin) → Control room
│   │   ├── OrdersPage.jsx       ← /admin/orders (admin) → Order tracking
│   │   ├── HealthPage.jsx       ← /admin/system-health (admin) → Health status
│   │   └── LogsPage.jsx         ← /admin/logs (admin) → System logs
│   │
│   ├── services/                [API & DATA SERVICES]
│   │   └── api.js               - Axios instance, API functions
│   │
│   ├── routes/                  [ROUTE DEFINITIONS] (empty - routes in App.jsx)
│   │
│   ├── App.jsx                  [MAIN APPLICATION]
│   │                             - Router setup
│   │                             - Auth context provider
│   │                             - Route definitions with guards
│   │
│   ├── main.jsx                 [REACT ENTRY POINT]
│   │                             - Renders App to DOM
│   │                             - Creates React root
│   │
│   └── styles.css               [GLOBAL STYLING]
│                                 - Dark theme with orange accent
│                                 - Responsive design
│                                 - Component-specific styles
│
├── package.json                 [DEPENDENCIES & SCRIPTS]
├── vite.config.js              [BUILD CONFIGURATION]
├── .env.example                [ENVIRONMENT VARIABLES TEMPLATE]
├── .gitignore
├── README.md                   [FULL DOCUMENTATION]
└── QUICKSTART.md              [GETTING STARTED GUIDE]
```

---

## 🔄 Data Flow & Architecture

### Authentication Flow
```
User visits app
    ↓
AuthContext checks localStorage
    ↓
User is redirected to /login or /
    ↓
User enters credentials
    ↓
Login function stores user in context + localStorage
    ↓
App re-renders with authenticated state
    ↓
Navbar shows user-specific menu
    ↓
Routes become accessible based on role
```

### Route Protection Flow
```
User navigates to protected route
    ↓
ProtectedRoute component checks context
    ↓
If authenticated? → Show page
If not?           → Redirect to /login
    ↓
AdminRoute also checks user.role === 'admin'
If not admin?      → Redirect to /
```

### Component Hierarchy
```
App (Router + AuthProvider)
    ↓
Navbar (shows role-based menu)
    ↓
Routes
    ├─ /login → Login page
    ├─ /signup → Signup page
    └─ / → Protected routes
        ├─ User → Home page
        └─ Admin → Dashboard + sub-routes
            ├─ /admin → Dashboard
            ├─ /admin/orders → Orders
            ├─ /admin/system-health → Health
            └─ /admin/logs → Logs
```

---

## 👥 User Roles & Permissions

### Regular User (role: "user")
✅ Access: `/`, `/login`, `/signup`
❌ Blocked from: Admin routes
📍 Can: See home page, logout, view limited features

### Admin User (role: "admin")
✅ Access: All routes including `/admin/*`
❌ Blocked from: Nothing (has full access)
📍 Can: View dashboards, track orders, monitor health, view logs

### Unauthenticated Users
✅ Access: `/login`, `/signup`
❌ Blocked from: All authenticated routes
📍 Can: Login or create account

---

## 🔑 Key Technologies

| Technology | Purpose | Version |
|-----------|---------|---------|
| React | UI Framework | ^19.2.4 |
| React Router | Page Navigation | ^7.14.0 |
| Axios | HTTP Client | ^1.14.0 |
| Recharts | Charts & Graphs | ^3.8.1 |
| Vite | Build Tool | ^8.0.7 |
| CSS3 | Styling | Native |

---

## 🎨 Design System

### Color Palette
- **Background**: `#11120d` (very dark)
- **Panel**: `#25281f` (dark gray)
- **Text**: `#f6f5ef` (off-white)
- **Accent**: `#ff8b3d` (orange) ✨
- **Success**: `#56d364` (green) ✅
- **Warning**: `#ffb703` (yellow) ⚠️
- **Error**: `#f85757` (red) ❌

### Typography
- **Headings**: Space Grotesk (Bold)
- **Body**: Space Grotesk (Regular)
- **Code**: IBM Plex Mono

### Responsive Breakpoints
- **Desktop**: 1200px max-width container
- **Tablet**: Grid adjusts to 2 columns
- **Mobile**: Single column layout, hidden elements

---

## 📡 API Integration

### Available API Functions (in src/services/api.js)

```javascript
getOrders()           → Returns array of orders
getSystemHealth()     → Returns service health status
getLogs()            → Returns system logs
getGatewayBaseUrl()  → Returns API gateway URL
```

### Environment Variables

Create `.env` file:
```
VITE_API_GATEWAY_URL=http://localhost:5000
```

### API Response Format

Orders:
```json
[
  {
    "id": "order123",
    "userId": "user456",
    "status": "PAID",
    "total": 99.99,
    "createdAt": "2024-04-08T10:30:00Z"
  }
]
```

System Health:
```json
{
  "gateway": "ok",
  "orderService": "ok",
  "inventoryService": "healthy",
  "paymentWorker": "up",
  "redis": "ok",
  "updatedAt": "2024-04-08T10:30:00Z"
}
```

---

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
```
http://localhost:5173
```

Use demo credentials:
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

---

## 📋 Demo Credentials

### Admin Account
```
Email: admin@example.com
Password: admin123
```
**Access**: Full admin dashboard, all admin features

### User Account
```
Email: user@example.com
Password: user123
```
**Access**: Home page only, no admin features

---

## 🔧 Configuration & Customization

### Change Port
Edit `vite.config.js`:
```javascript
server: {
  port: 3000,  // Change this
  host: true
}
```

### Update API Endpoint
Edit `.env`:
```
VITE_API_GATEWAY_URL=http://your-backend:5000
```

### Modify Theme Colors
Edit `src/styles.css`:
```css
:root {
  --accent: #ff8b3d;  /* Change orange to your color */
  --bg-0: #11120d;    /* Change backgrounds */
  /* etc... */
}
```

### Add New Admin Page
1. Create `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx`
3. Add link in `src/components/Navbar.jsx`

---

## 🐛 Debugging Tips

### Check Auth State
Open browser DevTools → Console:
```javascript
// Check localStorage
localStorage.getItem('isAuthenticated')
localStorage.getItem('user')
```

### Monitor Network Calls
DevTools → Network tab → See all API calls

### Check Component State
React DevTools (browser extension):
- Inspect AuthContext state
- View component tree
- Check props flowing through components

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot find module" | Missing dependency | Run `npm install` |
| Port 5173 busy | Port already in use | Use `npm run dev -- --port 3000` |
| Auth not persisting | localStorage disabled | Use incognito mode or clear cache |
| API calls failing | Backend not running | Start backend on port 5000 |
| Navbar not showing | Router not working | Check App.jsx routing setup |

---

## 📚 Additional Resources

- **React Docs**: https://react.dev
- **React Router**: https://reactrouter.com
- **Axios**: https://axios-http.com
- **Recharts**: https://recharts.org
- **Vite**: https://vitejs.dev

---

## ✅ Project Checklist

- [x] Authentication system (context-based)
- [x] Protected routes (ProtectedRoute & AdminRoute)
- [x] Navbar with role-based menu
- [x] Login & Signup pages
- [x] Home page for users
- [x] Admin dashboard with KPIs
- [x] Orders tracking page
- [x] System health monitoring
- [x] Logs viewer
- [x] Global styling (dark theme)
- [x] Responsive design
- [x] API service integration
- [x] LocalStorage persistence
- [x] Demo credentials
- [x] Complete documentation

---

## 🎯 Next Steps

1. **Test the app** - Use demo credentials to explore all features
2. **Review code** - Understand how authentication and routing works
3. **Connect backend** - Update API calls in `src/services/api.js`
4. **Customize** - Change colors, add more features, personalize
5. **Deploy** - Build and deploy to production when ready

---

## 📞 Support

- Check the README.md for detailed documentation
- Review QUICKSTART.md for quick setup guide
- Examine code comments in each file
- Check browser console for errors

---

🎉 **Your complete distributed e-commerce frontend is ready to use!**

Start the dev server and login with the demo credentials to see it in action.

```bash
npm run dev
```

Then navigate to `http://localhost:5173` 🚀
