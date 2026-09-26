import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

function clearGuestSession() {
  const keys = [
    'name', 'birthdate', 'gender', 'zodiac_sign', 
    'temp_zodiac', 'undertone', 'temp_undertone', 
    'season', 'temp_season', 'zodiac_trait'
  ];
  keys.forEach((key) => {
    sessionStorage.removeItem(key);
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, fetchUserProfile } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Discard any leftover guest quiz data to prevent overwriting saved user data
        clearGuestSession();

        // Refresh existing profile directly from database
        if (fetchUserProfile) {
          await fetchUserProfile();
        }

        // Dedicated Role Routing
        if (result.user?.is_admin || result.user?.role === 'admin') {
          navigate('/admin/users', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setErrorMessage(result.error || 'Invalid email or password.');
      }
    } catch (err) {
      setErrorMessage('Unable to connect to server. Please wait a moment and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPageWrapper}>
      <div className={styles.loginBox}>
        <div className={styles.brandTitle}>CELESTICARE</div>
        <div className={styles.loginHeading}>Log in to your profile</div>

        {searchParams.get('verified') === '1' && (
          <div className={styles.alertSuccess}>Email verified. You can now log in.</div>
        )}
        {searchParams.get('verified') === '0' && (
          <div className={styles.alertDanger}>That verification link is invalid or expired.</div>
        )}

        {errorMessage && (
          <div className={styles.alertDanger}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={styles.formControl}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.passwordContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              className={styles.formControl}
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁' : '🔒'}
            </button>
          </div>

          <button type="submit" className={styles.btnLogin} disabled={loading}>
            {loading ? 'Connecting...' : 'Login'}
          </button>
        </form>

        <div className={styles.textMuted}>
          Don't have a profile? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}