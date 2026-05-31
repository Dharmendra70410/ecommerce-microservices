import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupUser } from '../services/api';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!name.trim()) {
        throw new Error('Name is required');
      }

      const cleanEmail = email.trim();

      const response = await signupUser({
        name: name.trim(),
        email: cleanEmail,
        password
      });

      if (response?.userId) {
        localStorage.setItem('userId', response.userId);
      }

      localStorage.setItem('pendingVerificationEmail', cleanEmail);
      const pendingVerificationContext = JSON.stringify({
        email: cleanEmail,
        name: name.trim(),
        password
      });

      localStorage.setItem('pendingVerificationContext', pendingVerificationContext);
      sessionStorage.setItem('pendingVerificationContext', pendingVerificationContext);

      if (response?.message) {
        setSuccess(response.message);
      } else {
        setSuccess('Account created successfully. Please check your email for the verification OTP.');
      }
      navigate('/verify-email', {
        state: {
          email: cleanEmail,
          name: name.trim(),
          password
        }
      });
    } catch (err) {
      const statusCode = err.response?.status;
      const apiMessage = err.response?.data?.message;

      if (statusCode === 409) {
        setError(apiMessage || 'Account already exists. Please use a different email or login.');
      } else if (statusCode === 503) {
        setError('Gateway is reachable but registration service is temporarily unavailable. Please try again in a moment.');
      } else {
        setError(apiMessage || err.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
          </div>

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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Creating account...' : 'Signup'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
        <p className="auth-link">
          Got OTP already? <Link to="/verify-email">Verify email here</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
  