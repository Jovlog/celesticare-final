import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/axios';
import styles from './GetToKnow.module.css';

// Exact zodiac date calculation logic from get_to_know.php
export const calculateZodiacSign = (birthdate) => {
  if (!birthdate) return '';
  const date = new Date(birthdate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';

  return '';
};

function setCookie(name, value, days = 30) {
  const date = new Date();
  date.setTime(date.getTime() + days * 86400 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/`;
}

export default function GetToKnow() {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user;
  const updateUserProfile = auth?.updateUserProfile || auth?.updateUserProfileData;

  const [formData, setFormData] = useState({
    name: sessionStorage.getItem('name') || '',
    birthdate: sessionStorage.getItem('birthdate') || '',
    gender: sessionStorage.getItem('gender') || ''
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        birthdate: user.birthdate || prev.birthdate,
        gender: user.gender || prev.gender
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, birthdate, gender } = formData;
    const zodiac_sign = calculateZodiacSign(birthdate);

    // Save to sessionStorage and cookies for guest and session persistence
    sessionStorage.setItem('name', name);
    sessionStorage.setItem('birthdate', birthdate);
    sessionStorage.setItem('gender', gender);
    sessionStorage.setItem('zodiac_sign', zodiac_sign);
    sessionStorage.setItem('temp_zodiac', zodiac_sign);

    setCookie('name', name, 30);
    setCookie('birthdate', birthdate, 30);
    setCookie('gender', gender, 30);
    setCookie('zodiac_sign', zodiac_sign, 30);

    if (typeof updateUserProfile === 'function') {
      try {
        await updateUserProfile({ name, birthdate, gender, zodiac_sign });
      } catch (err) {
        console.warn('Context update error:', err);
      }
    }

    const effectiveUserId = user?.id || user?.sql_id;
    if (effectiveUserId) {
      try {
        await fetch(`${API_BASE_URL}/user/profile`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            userId: effectiveUserId,
            name,
            birthdate,
            gender,
            zodiac_sign
          })
        });
      } catch (err) {
        console.error('Error saving user profile:', err);
      }
    }

    // Direct routing to Zodiac Result
    navigate('/zodiac/zodiac-result');
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.bgAccentOne}></div>
      <div className={styles.bgAccentTwo}></div>

      <div className={styles.setupContainer}>
        <div className={styles.setupBox}>
          <div className={styles.brandTitle}>CELESTICARE</div>
          <h2>Time to get to know you</h2>
          <p>Provide the following details below</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                name="name"
                className={styles.formControl}
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <input
                type="date"
                name="birthdate"
                className={styles.formControl}
                value={formData.birthdate}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <select
                name="gender"
                className={styles.formControl}
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Masculine, Feminine
                </option>
                <option value="Masculine">Masculine</option>
                <option value="Feminine">Feminine</option>
              </select>
            </div>

            <button type="submit" className={styles.btnContinue}>
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}