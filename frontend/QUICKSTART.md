# Quick Start Guide - Distributed Commerce Frontend

## File Checklist ✅

Your project structure is now complete with:

```
✅ Authentication System
   - AuthContext.jsx (global state)
   - Login.jsx & Signup.jsx (auth pages)

✅ Route Protection
   - ProtectedRoute.jsx (for authenticated users)
   - AdminRoute.jsx (for admin only)

✅ Navigation
   - Navbar.jsx (with role-based menu)

✅ Pages
   - Home.jsx (user home page)
   - DashboardPage.jsx (admin dashboard)
   - OrdersPage.jsx (order tracking)
   - HealthPage.jsx (system health)
   - LogsPage.jsx (logs viewer)

✅ Components
   - KPICard.jsx (reusable card)

✅ Styling
   - styles.css (complete dark theme)

✅ Configuration
   - vite.config.js (build config)
   - package.json (dependencies)
```

## Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Server will start at: `http://localhost:5173`

### 3. Test with Demo Credentials

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

**User Account:**
- Email: `user@example.com`
- Password: `user123`

## Features You Can Use

### As Admin User:
1. View **Dashboard** with order statistics
2. Track **Orders** with search functionality
3. Check **System Health** of all services
4. View **Logs** of system events
5. See charts and real-time metrics

### As Regular User:
1. Browse the **Home** page
2. See product browsing options
3. Limited view (no admin features)

## Key Components & Their Purpose

### 1. AuthContext (contexts/AuthContext.jsx)
- Manages global authentication state
- Handles login, logout, signup
- Persists user data to localStorage

### 2. ProtectedRoute (middleware/ProtectedRoute.jsx)
- Prevents unauthenticated users from accessing protected pages
- Redirects to login if not authenticated

### 3. AdminRoute (middleware/AdminRoute.jsx)
- Restricts pages to admin-only users
- Checks both authentication and role

### 4. Navbar (components/Navbar.jsx)
- Shows different menu based on user role
- Handles logout functionality
- Displays current user info

### 5. API Service (services/api.js)
- Centralizes all API calls
- Uses Axios for HTTP requests
- Can be easily connected to real backend

## Customization Options

### Change Demo Credentials
Edit `src/pages/Login.jsx` - lines with `admin@example.com` and `user@example.com`

### Connect to Real Backend
1. Update API calls in `src/services/api.js`
2. Replace mock data with real API endpoints
3. Update `.env` with your backend URL

### Change Theme Colors
Edit the CSS variables in `src/styles.css` at the top:
```css
:root {
  --bg-0: #11120d;
  --accent: #ff8b3d;
  /* etc... */
}
```

### Add More Pages
1. Create new component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add Navbar link in `src/components/Navbar.jsx`

## Troubleshooting

### Port Already in Use
```bash
# Use different port
npm run dev -- --port 3000
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### localStorage Issues
- Clear browser cache or use incognito mode for clean testing

## Environment Setup

Create `.env` file in frontend folder:
```
VITE_API_GATEWAY_URL=http://localhost:5000
```

## Project Structure Summary

```
src/
├── App.jsx              ← Main routing logic
├── main.jsx             ← React entry point
├── styles.css           ← All styling
├── components/          ← Reusable UI components
├── contexts/            ← Global state (AuthContext)
├── middleware/          ← Route guards (ProtectedRoute, AdminRoute)
├── pages/               ← Page components
└── services/            ← API calls (axios)
```

## Next Steps

1. ✅ Review all files and understand the flow
2. ✅ Test with demo credentials
3. ✅ Try different user roles (Admin vs User)
4. ✅ Explore all admin pages and features
5. ✅ Connect to your backend API
6. ✅ Customize styling and content
7. ✅ Add additional features as needed

## Support & Help

- Check Console (F12) for debugging
- Review Network tab to see API calls
- Check LocalStorage to see auth state
- Read comments in code files

## Technologies Used

- **React 19** - UI library
- **React Router 7** - Navigation
- **Axios** - HTTP client
- **Recharts** - Charts & graphs
- **Vite** - Build tool
- **CSS3** - Styling

---

Happy coding! 🚀
