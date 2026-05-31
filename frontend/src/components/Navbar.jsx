import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🛒</span>
          Distributed Commerce
        </Link>

        <div className="navbar-links">
          {isAuthenticated ? (
            <Link to="/cart" className="nav-link cart-nav-link">
              Cart {cartCount > 0 ? <span className="cart-count-badge">{cartCount}</span> : null}
            </Link>
          ) : null}

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Signup</Link>
            </>
          ) : (
            <div className="profile-menu" ref={menuRef}>
              <button
                type="button"
                className="profile-trigger"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
              >
                {user?.username || 'User'}
                <span className={`profile-caret ${isMenuOpen ? 'profile-caret-open' : ''}`}>▾</span>
              </button>

              {isMenuOpen && (
                <div className="profile-dropdown" role="menu">
                  <Link
                    to="/profile"
                    className="profile-item"
                    role="menuitem"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user?.role === 'admin' ? 'Admin Profile' : 'User Profile'}
                  </Link>

                  {user?.role !== 'admin' && (
                    <Link
                      to="/profile/orders"
                      className="profile-item"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Orders
                    </Link>
                  )}

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="profile-item"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <button type="button" className="profile-item" role="menuitem" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
