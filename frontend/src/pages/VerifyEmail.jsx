import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signupUser, verifyEmail } from '../services/api';

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const tokenFromLink = new URLSearchParams(location.search).get('token') || '';
  const otpInputRefs = useRef([]);

  const initialEmail = useMemo(() => {
    return (
      location.state?.email ||
      localStorage.getItem('pendingVerificationEmail') ||
      ''
    );
  }, [location.state?.email]);

  const signupContext = useMemo(() => {
    const storedContext = localStorage.getItem('pendingVerificationContext') || sessionStorage.getItem('pendingVerificationContext');
    let parsedContext = {};

    if (storedContext) {
      try {
        parsedContext = JSON.parse(storedContext);
      } catch (_error) {
        parsedContext = {};
      }
    }

    return {
      ...(parsedContext || {}),
      ...(location.state || {})
    };
  }, [location.state]);

  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [isEditingEmail, setIsEditingEmail] = useState(!initialEmail);

  useEffect(() => {
    if (tokenFromLink || resendCountdown <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setResendCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendCountdown, tokenFromLink]);

  const otp = useMemo(() => otpDigits.join(''), [otpDigits]);

  const formatTimer = (value) => {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const focusOtpField = (index) => {
    const field = otpInputRefs.current[index];
    if (field) {
      field.focus();
      field.select();
    }
  };

  const handleOtpChange = (index, rawValue) => {
    const value = rawValue.replace(/\D/g, '').slice(-1);

    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    if (value && index < 5) {
      focusOtpField(index + 1);
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      focusOtpField(index - 1);
    }
  };

  const handleOtpPaste = (event) => {
    const pastedDigits = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
      .split('');

    if (!pastedDigits.length) {
      return;
    }

    event.preventDefault();

    setOtpDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < 6; i += 1) {
        next[i] = pastedDigits[i] || '';
      }
      return next;
    });

    const targetIndex = Math.min(pastedDigits.length, 6) - 1;
    if (targetIndex >= 0) {
      focusOtpField(targetIndex);
    }
  };

  const sendOtpForEmail = async (targetEmail) => {
    const cleanEmail = targetEmail.trim();

    if (!cleanEmail) {
      throw new Error('Email is required to resend OTP');
    }

    localStorage.setItem('pendingVerificationEmail', cleanEmail);

    if (!signupContext.name || !signupContext.password) {
      throw new Error('Resend is only available immediately after signup. Please go back and sign up again, or use Change Email.');
    }

    const response = await signupUser({
      name: signupContext.name,
      email: cleanEmail,
      password: signupContext.password
    });

    setEmail(cleanEmail);
    setIsEditingEmail(false);
    setOtpDigits(['', '', '', '', '', '']);
    setResendCountdown(30);
    setSuccess(response?.message || 'A new verification email has been sent.');
    window.setTimeout(() => focusOtpField(0), 0);
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setResendLoading(true);

    try {
      await sendOtpForEmail(email);
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      setError(apiMessage || err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!tokenFromLink && isEditingEmail) {
      const cleanEmail = email.trim();

      if (!cleanEmail) {
        setError('Please enter a valid email');
        return;
      }

      setResendLoading(true);

      try {
        await sendOtpForEmail(cleanEmail);
      } catch (err) {
        const apiMessage = err.response?.data?.message;
        setError(apiMessage || err.message || 'Failed to resend OTP');
      } finally {
        setResendLoading(false);
      }

      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.trim();
      const cleanOtp = otp.trim();

      if (!tokenFromLink && !cleanEmail) {
        throw new Error('Email is required');
      }

      if (!tokenFromLink && !/^\d{6}$/.test(cleanOtp)) {
        throw new Error('OTP must be a 6-digit code');
      }

      const payload = tokenFromLink
        ? { token: tokenFromLink }
        : { email: cleanEmail, otp: cleanOtp };

      if (!tokenFromLink) {
        localStorage.setItem('pendingVerificationEmail', cleanEmail);
      }

      const response = await verifyEmail(payload);

      localStorage.removeItem('pendingVerificationEmail');
      localStorage.removeItem('pendingVerificationContext');
      sessionStorage.removeItem('pendingVerificationContext');
      setSuccess(response?.message || 'Email verified successfully. Please login.');

      setTimeout(() => {
        navigate('/login');
      }, 900);
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      setError(apiMessage || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Email</h2>
        <p className="auth-subtitle">
          {tokenFromLink
            ? 'Verification link detected. Click verify to complete email verification.'
            : 'Please enter the OTP sent to your email address.'}
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleVerify}>
          {!tokenFromLink && (
            <>
              {!isEditingEmail ? (
                <p className="otp-email-line">
                  <span>Please enter the OTP sent to </span>
                  <strong>{email || 'your email address'}</strong>
                  <button
                    type="button"
                    className="otp-change-btn"
                    onClick={() => {
                      setIsEditingEmail(true);
                      setOtpDigits(['', '', '', '', '', '']);
                      setResendCountdown(30);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Change
                  </button>
                </p>
              ) : (
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
                  <div className="otp-email-actions">
                    <button
                      type="button"
                      className="otp-change-btn"
                      onClick={async () => {
                        setError('');
                        setSuccess('');
                        setResendLoading(true);

                        try {
                          await sendOtpForEmail(email);
                        } catch (err) {
                          const apiMessage = err.response?.data?.message;
                          setError(apiMessage || err.message || 'Failed to resend OTP');
                        } finally {
                          setResendLoading(false);
                        }
                      }}
                      disabled={resendLoading}
                    >
                      {resendLoading ? 'Sending...' : 'Save Email'}
                    </button>
                  </div>
                </div>
              )}

              {!isEditingEmail && (
                <>
                  <div className="form-group">
                    <label htmlFor="otp-0">Verification OTP</label>
                    <div className="otp-row" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          ref={(el) => {
                            otpInputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          className="otp-input"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          aria-label={`OTP digit ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="otp-resend-row">
                    {resendCountdown > 0 ? (
                      <span className="otp-resend-text">Not received your code? {formatTimer(resendCountdown)}</span>
                    ) : (
                      <button
                        type="button"
                        className="otp-resend-btn"
                        onClick={handleResendOtp}
                        disabled={resendLoading}
                      >
                        {resendLoading ? 'Sending...' : 'Resend OTP'}
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Verifying...' : isEditingEmail && !tokenFromLink ? 'Save Email' : 'Verify Email'}
          </button>
        </form>

        <p className="auth-link">
          Already verified? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;
