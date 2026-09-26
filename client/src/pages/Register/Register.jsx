import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Register.module.css';

export default function Register() {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    admin_secret: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdminDomain = formData.email.trim().toLowerCase().endsWith('@celesticare.admin.com');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirm_password) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await register(formData);
      if (result.success) {
        setSuccessMessage(result.message || 'Check your email for a verification link, then log in.');
      } else {
        setErrorMessage(result.error || 'Registration failed.');
      }
    } catch (err) {
      setErrorMessage('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPageWrapper}>
      <div className={styles.loginBox}>
        <div className={styles.brandTitle}>CELESTICARE</div>
        <div className={styles.loginHeading}>Create your cosmic profile</div>

        {errorMessage && (
          <div className={styles.alertDanger}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className={styles.alertSuccess}>
            {successMessage} <Link to="/login">Log in</Link>
          </div>
        )}

        {!successMessage && <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className={styles.formControl}
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

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

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={styles.formControl}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm Password"
              className={styles.formControl}
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
          </div>

          {isAdminDomain && (
            <div>
              <input
                type="password"
                name="admin_secret"
                placeholder="Admin Secret Key"
                className={styles.formControl}
                value={formData.admin_secret}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" className={styles.btnLogin} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>}

        <div className={styles.textMuted}>
          Already have a profile? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}