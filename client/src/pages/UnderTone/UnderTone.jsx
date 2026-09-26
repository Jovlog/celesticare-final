import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/axios';
import styles from './UnderTone.module.css';

// Asset imports
import coolSkinImg from '../../assets/images/cool_skin.png';
import neutralSkinImg from '../../assets/images/neutral_skin.png';
import warmSkinImg from '../../assets/images/warm_skin.png';

// Exact season determination matrix from PHP
export const determineSeason = (zodiac, undertone) => {
  const seasonMap = {
    Aries: { cool: 'Spring', warm: 'Spring', neutral: 'Spring' },
    Taurus: { cool: 'Spring', warm: 'Spring', neutral: 'Spring' },
    Gemini: { cool: 'Summer', warm: 'Spring', neutral: 'Summer' },
    Cancer: { cool: 'Summer', warm: 'Summer', neutral: 'Summer' },
    Leo: { cool: 'Summer', warm: 'Autumn', neutral: 'Summer' },
    Virgo: { cool: 'Summer', warm: 'Autumn', neutral: 'Summer' },
    Libra: { cool: 'Autumn', warm: 'Autumn', neutral: 'Autumn' },
    Scorpio: { cool: 'Autumn', warm: 'Autumn', neutral: 'Autumn' },
    Sagittarius: { cool: 'Winter', warm: 'Autumn', neutral: 'Winter' },
    Capricorn: { cool: 'Winter', warm: 'Winter', neutral: 'Winter' },
    Aquarius: { cool: 'Winter', warm: 'Winter', neutral: 'Winter' },
    Pisces: { cool: 'Winter', warm: 'Spring', neutral: 'Winter' },
  };
  return seasonMap[zodiac]?.[undertone] || 'Spring';
};

// Cookie helpers
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value, days = 30) {
  const date = new Date();
  date.setTime(date.getTime() + days * 86400 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/`;
}

export default function UnderTone() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token, updateUserProfileData } = useAuth();
  const [zodiac, setZodiac] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentZodiac =
      user?.zodiac_sign ||
      sessionStorage.getItem('zodiac_sign') ||
      sessionStorage.getItem('temp_zodiac') ||
      getCookie('zodiac_sign');

    const isMobile = searchParams.get('mobile') === '1';

    if (!currentZodiac) {
      navigate(`/zodiac/zodiac-result${isMobile ? '?mobile=1' : ''}`);
    } else {
      setZodiac(currentZodiac);
    }
  }, [user, navigate, searchParams]);

  const handleToneSelect = async (tone) => {
    if (loading) return;
    setLoading(true);

    const calculatedSeason = determineSeason(zodiac, tone);

    // Save temporary data to sessionStorage & cookies for guests
    sessionStorage.setItem('undertone', tone);
    sessionStorage.setItem('temp_zodiac', zodiac);
    sessionStorage.setItem('temp_undertone', tone);
    sessionStorage.setItem('temp_season', calculatedSeason);

    setCookie('undertone', tone, 30);
    setCookie('temp_zodiac', zodiac, 1);
    setCookie('temp_undertone', tone, 1);
    setCookie('temp_season', calculatedSeason, 1);

    if (updateUserProfileData) {
      updateUserProfileData({
        undertone: tone,
        season: calculatedSeason,
        zodiac_sign: zodiac
      });
    }

    // Persist to backend if logged in
    const effectiveUserId = user?.id || user?.sql_id;
    const storedToken = token || localStorage.getItem('token');

    if (effectiveUserId) {
      const payload = {
        user_id: effectiveUserId,
        undertone: tone,
        zodiac: zodiac,
        season: calculatedSeason,
      };

      try {
        await fetch(`${API_BASE_URL}/undertone/save`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(storedToken && { Authorization: `Bearer ${storedToken}` })
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error('Error saving undertone to backend:', err);
      }
    }

    const isMobile = searchParams.get('mobile') === '1';
    const destination = `/undertone/result${isMobile ? '?mobile=1' : ''}`;

    setTimeout(() => {
      navigate(destination);
    }, 400);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.quizBox}>
        <h1 className={styles.heading}>Let's know your undertone</h1>
        <p className={styles.subtext}>
          Check the color of your veins on your wrist and tap the image that matches your skin tone.
        </p>

        <div className={styles.imagesContainer}>
          {/* Cool Undertone */}
          <button
            type="button"
            className={styles.imageWrapper}
            onClick={() => handleToneSelect('cool')}
          >
            <div
              className={styles.imageOption}
              style={{ backgroundImage: `url(${coolSkinImg})` }}
            />
            <div className={styles.label}>Cool</div>
          </button>

          {/* Neutral Undertone */}
          <button
            type="button"
            className={styles.imageWrapper}
            onClick={() => handleToneSelect('neutral')}
          >
            <div
              className={styles.imageOption}
              style={{ backgroundImage: `url(${neutralSkinImg})` }}
            />
            <div className={styles.label}>Neutral</div>
          </button>

          {/* Warm Undertone */}
          <button
            type="button"
            className={styles.imageWrapper}
            onClick={() => handleToneSelect('warm')}
          >
            <div
              className={styles.imageOption}
              style={{ backgroundImage: `url(${warmSkinImg})` }}
            />
            <div className={styles.label}>Warm</div>
          </button>
        </div>

        <div className={styles.notesContainer}>
          <div className={styles.note}>
            • Use daylight for best accuracy to see your vein color clearly.
          </div>
          <div className={styles.note}>
            • Gold jewelry suits warm undertones, silver suits cool. Both look good? You may be neutral.
          </div>
        </div>
      </div>

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <p>Analyzing your undertone...</p>
          </div>
        </div>
      )}
    </div>
  );
}