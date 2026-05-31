import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api';

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const tokenFromLink = new URLSearchParams(location.search).get('token') || '';
  const initialEmail = location.state?.email || localStorage.getItem('pendingResetEmail') || '';

  const [token, setToken] = useState(tokenFromLink);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const cleanToken = token.trim();
      const cleanEmail = email.trim();

      if (!cleanToken) {
        throw new Error('Reset OTP/token is required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!tokenFromLink && !cleanEmail) {
        throw new Error('Email is required');
      }

      if (!tokenFromLink) {
        localStorage.setItem('pendingResetEmail', cleanEmail);
      }

      const payloadAttempts = tokenFromLink
        ? [{ token: cleanToken, password }]
        : [
            { email: cleanEmail, otp: cleanToken, password },
            { email: cleanEmail, token: cleanToken, password },
            { token: cleanToken, password }
          ];

      let response = null;
      let lastError = null;

      for (const payload of payloadAttempts) {
        try {
          response = await resetPassword(payload);
          break;
        } catch (err) {
          lastError = err;
          if (![400, 401, 404].includes(err.response?.status)) {
            throw err;
          }
        }
      }

      if (!response && lastError) {
        throw lastError;
      }

      setSuccess(response?.message || 'Password reset successful. Redirecting to login...');
      localStorage.removeItem('pendingResetEmail');
      window.setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      setError(apiMessage || err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-subtitle">Set your new password to continue.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          {!tokenFromLink && (
            <>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="token">Reset OTP / Token</label>
                <input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  placeholder="Enter reset OTP or token"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter new password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="auth-link">
          Back to <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
