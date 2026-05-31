# ⚡ Quick Reference Cheat Sheet

## 🚀 Getting Started (5 Minutes)

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
http://localhost:5173
```

## 🔐 Demo Logins

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `admin123` |
| User | `user@example.com` | `user123` |

## 📍 Key Routes

| Route | Accessible To | Component |
|-------|---------------|-----------|
| `/login` | Everyone | Login page |
| `/signup` | Everyone | Signup page |
| `/` | Authenticated Users | Home (users) / Dashboard (admins) |
| `/admin` | Admin Only | Control room dashboard |
| `/admin/orders` | Admin Only | Order tracking |
| `/admin/system-health` | Admin Only | System health |
| `/admin/logs` | Admin Only | System logs |

## 🎯 What to Test

### As Admin (`admin@example.com` / `admin123`)
- [ ] Dashboard with KPI cards
- [ ] Orders tracking with search
- [ ] System health status
- [ ] View system logs
- [ ] See area chart (7-day orders)
- [ ] Logout button

### As User (`user@example.com` / `user123`)
- [ ] Home page appears
- [ ] Admin routes are blocked
- [ ] Limited navigation menu
- [ ] Can logout

### Unauthenticated
- [ ] Can access /login and /signup
- [ ] Cannot access protected routes
- [ ] Gets redirected to login

## 🎨 Theme Colors

```css
Orange:  #ff8b3d  (primary accent)
Green:   #56d364  (success/ok)
Yellow:  #ffb703  (warning)
Red:     #f85757  (error/failed)
Dark:    #11120d  (background)
Light:   #f6f5ef  (text)
```

## 📁 Important Files to Know

```
App.jsx          → Main routing (edit here to add routes)
styles.css       → Colors, layout (edit for styling)
AuthContext.jsx  → Login/logout logic (edit for real auth)
api.js           → API calls (edit to connect backend)
Navbar.jsx       → Top menu (edit for navigation items)
```

## 🔗 Component Usage

### ProtectedRoute (for authenticated users)
```jsx
<Route path="/protected" element={<ProtectedRoute><Page /></ProtectedRoute>} />
```

### AdminRoute (for admin users only)
```jsx
<Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
```

### useAuth Hook (in any component)
```jsx
const { isAuthenticated, user, login, logout } = useAuth();
```

## 📦 npm Commands

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Build for production
npm run preview   # Preview production build
npm install       # Install dependences
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5173 busy | `npm run dev -- --port 3000` |
| Module not found | `npm install` |
| Auth not persisting | Incognito mode / Clear cache |
| API fails | Ensure backend running on :5000 |

## 📚 Documentation Files

| File | Contents |
|------|----------|
| `README.md` | Full documentation |
| `QUICKSTART.md` | Getting started guide |
| `PROJECT_OVERVIEW.md` | Architecture & design |
| `FILE_REFERENCE.md` | File descriptions |
| `CHEATSHEET.md` | This file |

## 🎯 Common Customizations

### Change Theme Color
Edit `src/styles.css` line ~3:
```css
--accent: #ff8b3d;  /* Change to your color */
```

### Change API URL
Create/edit `.env`:
```
VITE_API_GATEWAY_URL=http://your-backend:5000
```

### Add New Admin Page
1. Create `src/pages/NewPage.jsx`
2. Import in `src/App.jsx`
3. Add route in AppRoutes
4. Add link in `src/components/Navbar.jsx`

### Change Demo Credentials
Edit `src/pages/Login.jsx` around line 15-30

## 🏗️ Project Structure at a Glance

```
frontend/
├── src/
│   ├── App.jsx                    [ROUTING]
│   ├── styles.css                 [STYLING]
│   ├── components/                [REUSABLE COMPONENTS]
│   ├── contexts/                  [GLOBAL STATE]
│   ├── middleware/                [ROUTE GUARDS]
│   ├── pages/                     [PAGE COMPONENTS]
│   └── services/                  [API CALLS]
├── package.json
├── vite.config.js
└── index.html
```

## 🔄 Authentication Flow

```
User Visits App
    ↓
AuthContext checks localStorage
    ↓
Not authenticated? → Redirect to /login
    ↓
User enters credentials
    ↓
Login func stores in context + localStorage
    ↓
Navigate to home/dashboard
    ↓
Role determines visible features
```

## 🎨 Component Hierarchy

```
App
├─ AuthProvider (global auth state)
├─ BrowserRouter (routing)
├─ Navbar (navigation)
└─ Routes
   ├─ Login
   ├─ Signup
   └─ Protected Routes
      └─ Pages with data
```

## 📊 Admin Dashboard Features

✅ Operations Snapshot (KPI cards)
✅ Total Orders, Paid, Pending, Failed
✅ Orders chart (7-day trend)
✅ Search orders
✅ Monitor service health
✅ View system logs

## 👥 User System

**Admin User Access:**
- View all dashboards
- Track orders
- Monitor health
- View logs
- Full feature access

**Regular User Access:**
- Home page only
- Limited navigation
- No admin features

**Not Logged In Access:**
- Login page
- Signup page
- Redirect to login on private routes

## 🔗 External Resources

- **React**: https://react.dev
- **React Router**: https://reactrouter.com
- **Axios**: https://axios-http.com
- **Recharts**: https://recharts.org
- **Vite**: https://vitejs.dev

## ⏱️ Typical Workflow

```
1. Login with admin@example.com
2. Explore Dashboard (KPIs, Charts)
3. Check Orders page (search, filter)
4. Verify System Health status
5. Review Logs
6. Logout
7. Login as user@example.com
8. See Home page only
```

## 🚀 Next Steps

1. ✅ Run `npm install && npm run dev`
2. ✅ Test with demo credentials
3. ✅ Explore all pages and features
4. ✅ Review code in key files
5. ✅ Connect to real backend
6. ✅ Customize colors & content
7. ✅ Deploy to production

## 💡 Pro Tips

- Use browser DevTools to inspect DOM
- Check Console for errors
- Use Network tab to see API calls
- Use React DevTools extension
- localStorage stores auth between refreshes
- Demo data comes from backend simulator

## 📞 Need Help?

1. Check README.md for detailed docs
2. Check FILE_REFERENCE.md for file locations
3. Review PROJECT_OVERVIEW.md for architecture
4. Check browser console for errors
5. Look at similar implementations in code

---

**Everything is ready to go! Start with `npm run dev` 🎉**
