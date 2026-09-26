import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './UndertoneResult.module.css';

// Asset imports
import coolWheelImg from '../../assets/images/cool_wheel.png';
import warmWheelImg from '../../assets/images/warm_wheel.png';
import neutralWheelImg from '../../assets/images/neutral_wheel.png';

const PALETTES = {
  Aries: {
    cool: ["#131111", "#6b0e3d", "#80012b", "#ad0f53", "#8b3979", "#f4338a"],
    warm: ["#40180b", "#88171c", "#d72113", "#f0500c", "#ff762d", "#ff9a51"],
    neutral: ["#7f1619", "#9b2627", "#bd5858", "#926454", "#b8717e", "#efaeb4"]
  },
  Taurus: {
    cool: ["#22a068", "#ff5ee1", "#ff9afb", "#9bee99", "#ffc8fb", "#a7efcb"],
    warm: ["#2e3f16", "#3a5d09", "#7bab44", "#b25526", "#ff762d", "#ffc451"],
    neutral: ["#253e18", "#9d6f45", "#689257", "#c68139", "#eccb67", "#a4c49c"]
  },
  Gemini: {
    cool: ["#052542", "#175374", "#9e37a0", "#b478cd", "#e669ef", "#82d3d7"],
    warm: ["#567b18", "#55844f", "#ffa408", "#fab738", "#afd84b", "#ffcf40"],
    neutral: ["#19344d", "#435c89", "#807145", "#5e666b", "#cea63f", "#96accd"]
  },
  Cancer: {
    cool: ["#0c205b", "#212d9b", "#009cff", "#81b0ff", "#a3e6ff", "#85e9e9"],
    warm: ["#0c3b3b", "#097b77", "#17cba0", "#5df6bf", "#a5ffe7", "#b3ffc8"],
    neutral: ["#013b60", "#2b2f59", "#435c89", "#5e5f73", "#a5b2c2", "#cddfeb"]
  },
  Leo: {
    cool: ["#5b204e", "#862d58", "#7c465d", "#cf1e5a", "#ff0068", "#be2736"],
    warm: ["#774526", "#c43b3b", "#ac4b2a", "#fa4d00", "#ff6a04", "#f28115"],
    neutral: ["#52351a", "#724923", "#a96236", "#c78d2f", "#d09940", "#edc98b"]
  },
  Virgo: {
    cool: ["#043921", "#034d37", "#00835e", "#4bcbaa", "#4df2cc", "#a0dbbf"],
    warm: ["#0f3917", "#6d3d12", "#376b32", "#9d6216", "#5a6b19", "#e17e16"],
    neutral: ["#3b4626", "#596b3c", "#857039", "#a5a95e", "#d1ac6d", "#ddb793"]
  },
  Libra: {
    cool: ["#622674", "#6d4b66", "#9b63c2", "#9683be", "#b4b0e1", "#ecc0d9"],
    warm: ["#569c7e", "#72af8e", "#ffaaa5", "#ffcbc3", "#dcedc1", "#ffe3c6"],
    neutral: ["#ecc0d9", "#7fa292", "#a6d2bb", "#f6bdb4", "#fdd8c6", "#fef0d5"]
  },
  Scorpio: {
    cool: ["#191933", "#461d49", "#15456b", "#44229a", "#7648b0", "#3a89db"],
    warm: ["#730101", "#b70000", "#e2293b", "#b2301f", "#c76a50", "#c18584"],
    neutral: ["#110f0d", "#4c3860", "#662a48", "#504840", "#867a6e", "#d6d5da"]
  },
  Sagittarius: {
    cool: ["#40007b", "#3830a0", "#24879d", "#7f1d80", "#ce2c82", "#ce6aac"],
    warm: ["#52201c", "#415715", "#fa7e1e", "#e7735a", "#aac265", "#edba4a"],
    neutral: ["#2c2956", "#4d234b", "#786988", "#6d76a7", "#5386a2", "#7b98b7"]
  },
  Capricorn: {
    cool: ["#001b33", "#2e3958", "#267b64", "#4d90cf", "#77d6c2", "#78b895"],
    warm: ["#3e1f1c", "#2e472a", "#662f0b", "#ac6114", "#639261", "#fedca3"],
    neutral: ["#303c54", "#667f61", "#979593", "#8d7d6d", "#6b9da6", "#c4af90"]
  },
  Aquarius: {
    cool: ["#293aaa", "#5f35b1", "#0768c9", "#ae4a8c", "#ad55ea", "#a09dea"],
    warm: ["#8a2a2b", "#108bff", "#ee8f21", "#f5c976", "#fffa81", "#eccbd1"],
    neutral: ["#44499a", "#4d90cf", "#78b895", "#75c3d0", "#76899f", "#bfafd3"]
  },
  Pisces: {
    cool: ["#007392", "#727cd6", "#b2adfd", "#64ffd5", "#b1d6ff", "#b4fff6"],
    warm: ["#ff8080", "#ffab88", "#fcb9b0", "#ffd2c9", "#fcf0da", "#ffebeb"],
    neutral: ["#39536d", "#1ba8a0", "#9e99d1", "#8ed1d1", "#a9d8de", "#b5e8d5"]
  }
};

const DESCRIPTIONS = {
  cool: "Cool undertones tend to have hints of blue, pink or red. They look best with silver jewelry and icy colors.",
  warm: "Warm undertones have hints of yellow, golden or peach. They glow with gold jewelry and warm earthy colors.",
  neutral: "Neutral undertones are balanced and can wear both warm and cool colors harmoniously."
};

const WHEEL_IMAGES = {
  cool: coolWheelImg,
  warm: warmWheelImg,
  neutral: neutralWheelImg
};

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function clearGuestCookies() {
  const cookies = ['name', 'birthdate', 'gender', 'zodiac_sign', 'temp_zodiac', 'undertone', 'temp_undertone', 'season', 'temp_season', 'zodiac_trait'];
  cookies.forEach((c) => {
    document.cookie = `${c}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
}

function clearGuestSession() {
  const keys = ['name', 'birthdate', 'gender', 'zodiac_sign', 'temp_zodiac', 'undertone', 'temp_undertone', 'season', 'temp_season', 'zodiac_trait'];
  keys.forEach((k) => sessionStorage.removeItem(k));
  clearGuestCookies();
}

export default function UndertoneResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, register, fetchUserProfile } = useAuth();

  const [zodiac, setZodiac] = useState('');
  const [undertone, setUndertone] = useState('');
  const [season, setSeason] = useState('');

  // Modal controls
  const [activeModal, setActiveModal] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  const wheelRef = useRef(null);
  const animationFrameRef = useRef(null);
  const angleRef = useRef(0);
  const lastTimeRef = useRef(0);

  const isMobile = searchParams.get('mobile') === '1';

  useEffect(() => {
    const storedZodiac =
      sessionStorage.getItem('temp_zodiac') ||
      getCookie('temp_zodiac') ||
      sessionStorage.getItem('zodiac_sign') ||
      getCookie('zodiac_sign') ||
      user?.zodiac_sign;

    const storedUndertone =
      sessionStorage.getItem('temp_undertone') ||
      getCookie('temp_undertone') ||
      sessionStorage.getItem('undertone') ||
      getCookie('undertone') ||
      user?.undertone;

    const storedSeason =
      sessionStorage.getItem('temp_season') ||
      getCookie('temp_season') ||
      sessionStorage.getItem('season') ||
      user?.season;

    if (!storedZodiac || !storedUndertone) {
      navigate(`/undertone/test${isMobile ? '?mobile=1' : ''}`);
      return;
    }

    setZodiac(storedZodiac);
    setUndertone(storedUndertone.toLowerCase());
    setSeason(storedSeason || '');
  }, [navigate, isMobile, user]);

  const handleMouseEnter = () => {
    lastTimeRef.current = 0;
    const degPerMs = (0.2 * 360) / 1000;

    const step = (now) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      angleRef.current = (angleRef.current + (now - lastTimeRef.current) * degPerMs) % 360;
      lastTimeRef.current = now;

      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${angleRef.current}deg)`;
      }
      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);
  };

  const handleMouseLeave = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // 1. LOGGING IN TO EXISTING ACCOUNT:
  // Discard the guest questionnaire session completely so existing profile is NOT overwritten
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalMessage('');
    setModalLoading(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        // Discard all guest quiz entries
        clearGuestSession();

        // Refresh user profile from database
        await fetchUserProfile();

        setActiveModal(null);
        navigate(`/dashboard${isMobile ? '?mobile=1' : ''}`);
      } else {
        setModalError(res.error || 'Invalid email or password.');
      }
    } catch {
      setModalError('Connection error. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  // 2. SIGNING UP FOR NEW ACCOUNT:
  // Save all collected answers into the new user profile in MongoDB
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalMessage('');

    if (regPassword !== regConfirm) {
      setModalError('Passwords do not match!');
      return;
    }
    if (regPassword.length < 8) {
      setModalError('Password must be at least 8 characters with 1 uppercase letter and no spaces!');
      return;
    }

    setModalLoading(true);

    const registerPayload = {
      email: regEmail,
      username: regUsername,
      password: regPassword,
      name: sessionStorage.getItem('name') || getCookie('name') || '',
      birthdate: sessionStorage.getItem('birthdate') || getCookie('birthdate') || '',
      gender: sessionStorage.getItem('gender') || getCookie('gender') || '',
      zodiac_sign: zodiac,
      undertone,
      season
    };

    try {
      const res = await register(registerPayload);
      if (res.success) {
        setModalMessage(res.message || 'Account created. Check your email for a verification link, then log in.');
      } else {
        setModalError(res.error || 'Registration failed.');
      }
    } catch {
      setModalError('Connection error. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  if (!zodiac || !undertone) return null;

  const currentPalette = PALETTES[zodiac]?.[undertone] || ["#ccc", "#999", "#666", "#333", "#000", "#fff"];
  const currentDescription = DESCRIPTIONS[undertone] || "Discover your unique color palette!";
  const currentWheel = WHEEL_IMAGES[undertone] || neutralWheelImg;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.brandHeading}>CELESTICARE</h1>

        <div className={styles.resultSection}>
          <div className={styles.imageBox}>
            <img
              ref={wheelRef}
              src={currentWheel}
              alt={`${undertone} Wheel`}
              className={styles.wheel}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              draggable={false}
            />
            <div className={styles.infoBox}>
              {zodiac}'s undertone gives insight into the best colors for your style and wardrobe.
            </div>
          </div>

          <div className={styles.textBox}>
            <h2>{zodiac} with a {undertone} undertone</h2>

            {season && (
              <div className={styles.seasonBox}>
                <strong>Your Season: {season}</strong>
              </div>
            )}

            <div className={styles.palette}>
              {currentPalette.map((color, index) => (
                <div
                  key={index}
                  className={styles.colorBox}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <p className={styles.description}>{currentDescription}</p>

            <div className={styles.infoBox}>
              These colors complement your undertone perfectly and can enhance your natural glow.
            </div>
            <div className={styles.infoBox}>
              Experiment with these shades in clothing, makeup, and accessories to find your signature look.
            </div>
          </div>
        </div>

        <div className={styles.continueWrapper}>
          {user ? (
            <button
              type="button"
              className={styles.btnContinue}
              onClick={() => {
                clearGuestSession();
                navigate(`/dashboard${isMobile ? '?mobile=1' : ''}`);
              }}
            >
              Continue to Dashboard
            </button>
          ) : (
            <button
              type="button"
              className={styles.btnLoginSubmit}
              onClick={() => {
                setModalError('');
                setModalMessage('');
                setActiveModal('login');
              }}
            >
              Continue
            </button>
          )}
        </div>
      </div>

      {/* LOGIN MODAL */}
      {activeModal === 'login' && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.closeModalBtn}
              onClick={() => setActiveModal(null)}
            >
              &times;
            </button>
            <div className={styles.brandTitle}>CELESTICARE</div>
            <h2>Log in to your account</h2>

            {modalError && <div className={styles.alertDanger}>{modalError}</div>}
            {modalMessage && <div className={styles.alertSuccess}>{modalMessage}</div>}

            <form onSubmit={handleLoginSubmit}>
              <input
                type="email"
                className={styles.formControl}
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />

              <div className={styles.passwordContainer}>
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  className={styles.formControl}
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowLoginPass(!showLoginPass)}
                >
                  <i className={showLoginPass ? 'far fa-eye-slash' : 'far fa-eye'}></i>
                </button>
              </div>

              <button 
                type="submit" 
                className={styles.btnLoginSubmit} 
                style={{ width: '100%' }}
                disabled={modalLoading}
              >
                {modalLoading ? 'Logging in...' : 'Login'}
              </button>

              <p className={styles.textMuted}>
                Don't have an account?{' '}
                <span onClick={() => { setModalError(''); setActiveModal('register'); }}>
                  Sign up
                </span>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER MODAL */}
      {activeModal === 'register' && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.closeModalBtn}
              onClick={() => setActiveModal(null)}
            >
              &times;
            </button>
            <div className={styles.brandTitle}>CELESTICARE</div>
            <h2>Create account to save your results</h2>

            {modalError && <div className={styles.alertDanger}>{modalError}</div>}
            {modalMessage && <div className={styles.alertSuccess}>{modalMessage}</div>}

            {!modalMessage && <form onSubmit={handleRegisterSubmit}>
              <input
                type="email"
                className={styles.formControl}
                placeholder="Email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />

              <input
                type="text"
                className={styles.formControl}
                placeholder="Username"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
              />

              <div className={styles.passwordContainer}>
                <input
                  type={showRegPass ? 'text' : 'password'}
                  className={styles.formControl}
                  placeholder="Password (min 8 chars, 1 uppercase)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowRegPass(!showRegPass)}
                >
                  <i className={showRegPass ? 'far fa-eye-slash' : 'far fa-eye'}></i>
                </button>
              </div>

              <input
                type="password"
                className={styles.formControl}
                placeholder="Confirm Password"
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                required
              />

              <button 
                type="submit" 
                className={styles.btnLoginSubmit} 
                style={{ width: '100%' }}
                disabled={modalLoading}
              >
                {modalLoading ? 'Creating account...' : 'Sign Up'}
              </button>

              <p className={styles.textMuted}>
                Already have an account?{' '}
                <span onClick={() => { setModalError(''); setActiveModal('login'); }}>
                  Login
                </span>
              </p>
            </form>}
            {modalMessage && (
              <p className={styles.textMuted}>
                After verifying your email,{' '}
                <span onClick={() => { setModalMessage(''); setModalError(''); setActiveModal('login'); }}>
                  log in
                </span>{' '}to save your results.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}