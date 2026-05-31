import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/api';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const cleanEmail = email.trim();
      const response = await forgotPassword({ email: cleanEmail });
      localStorage.setItem('pendingResetEmail', cleanEmail);
      setSuccess(response?.message || 'If this account exists, a reset link has been sent to your email.');
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      setError(apiMessage || err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to receive a password reset link.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
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

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {success && (
          <button
            type="button"
            className="auth-btn"
            onClick={() => navigate('/reset-password', { state: { email: email.trim() } })}
          >
            Enter OTP and Reset Password
          </button>
        )}

        <p className="auth-link">
          Remembered your password? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
