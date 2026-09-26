import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'node:crypto';
import User from '../models/User.js';
import { sendVerificationEmail } from '../config/mailer.js';
import { getAllowedRedirectOrigin } from '../config/corsOptions.js';

const ADMIN_EMAIL_DOMAIN = '@celesticare.admin.com';
const ADMIN_SECRET_KEY = 'CelestiCare2025!';
const DEFAULT_PASSWORD = 'CelestiCare123!';
const hashVerificationToken = (token) => createHash('sha256').update(token).digest('hex');

const redirectToLogin = (res, origin, verified) => {
  if (!origin) return false;
  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('verified', verified ? '1' : '0');
  res.redirect(loginUrl.toString());
  return true;
};

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { 
      username, 
      email, 
      password, 
      name, 
      birthdate, 
      gender, 
      zodiac_sign, 
      undertone, 
      season 
    } = req.body;

    const trimmedEmail = email.toLowerCase().trim();
    const isAdmin = trimmedEmail.endsWith(ADMIN_EMAIL_DOMAIN);

    if (isAdmin && password !== ADMIN_SECRET_KEY) {
      return res.status(400).json({
        success: false,
        error: 'Invalid admin secret key.'
      });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'This email is already registered.'
      });
    }

    const verificationToken = randomBytes(32).toString('hex');
    const verificationRedirectOrigin = getAllowedRedirectOrigin(req.get('origin'));
    const newUser = await User.create({
      username: username.trim(),
      email: trimmedEmail,
      password,
      isVerified: false,
      emailVerificationTokenHash: hashVerificationToken(verificationToken),
      emailVerificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      role: isAdmin ? 'admin' : 'user',
      is_admin: isAdmin,
      ...(name && { name }),
      ...(birthdate && { birthdate }),
      ...(gender && { gender }),
      ...(zodiac_sign && { zodiac_sign }),
      ...(undertone && { undertone }),
      ...(season && { season })
    });

    try {
      await sendVerificationEmail({
        email: newUser.email,
        username: newUser.username,
        token: verificationToken,
        redirectOrigin: verificationRedirectOrigin
      });
    } catch (error) {
      await newUser.deleteOne();
      console.error('[Email verification] Unable to send verification email:', error.message);
      return res.status(503).json({
        success: false,
        error: 'Email verification is temporarily unavailable. Please try again later.'
      });
    }

    res.status(201).json({
      success: true,
      requiresVerification: true,
      message: 'Account created. Check your email for a verification link, then log in.'
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/verify-email
export const showVerificationPrompt = (req, res) => {
  const token = req.query.token;
  const redirectOrigin = getAllowedRedirectOrigin(req.query.redirect_origin);
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
    return res.status(400).type('html').send('<!doctype html><html><body><h1>Invalid verification link</h1></body></html>');
  }

  const escapedToken = token.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const escapedOrigin = (redirectOrigin || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  res.type('html').send(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verify your email</title><body><main><h1>Verify your CelestiCare email</h1><p>Confirm below to activate your account.</p><form method="post" action="/api/auth/verify-email"><input type="hidden" name="token" value="${escapedToken}"><input type="hidden" name="redirect_origin" value="${escapedOrigin}"><button type="submit">Verify email</button></form></main></body></html>`);
};

// POST /api/auth/verify-email
export const verifyEmail = async (req, res, next) => {
  try {
    const redirectOrigin = getAllowedRedirectOrigin(req.body.redirect_origin);
    const token = req.body.token;
    if (typeof token !== 'string' || token.length > 200) {
      if (redirectToLogin(res, redirectOrigin, false)) return;
      return res.status(400).json({ success: false, error: 'Verification link is invalid or expired.' });
    }

    const user = await User.findOne({
      emailVerificationTokenHash: hashVerificationToken(token),
      emailVerificationTokenExpiresAt: { $gt: new Date() }
    }).select('+emailVerificationTokenHash +emailVerificationTokenExpiresAt');

    if (!user) {
      if (redirectToLogin(res, redirectOrigin, false)) return;
      return res.status(400).json({ success: false, error: 'Verification link is invalid or expired.' });
    }

    user.isVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationTokenExpiresAt = null;
    await user.save();

    if (redirectToLogin(res, redirectOrigin, true)) return;
    res.status(200).json({ success: true, message: 'Email verified. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = email.toLowerCase().trim();
    const isAdmin = trimmedEmail.endsWith(ADMIN_EMAIL_DOMAIN);

    const user = await User.findOne({ email: trimmedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email address before logging in.'
      });
    }

    let isMatch = false;
    if (isAdmin) {
      isMatch = password === ADMIN_SECRET_KEY || (await user.matchPassword(password));
    } else {
      isMatch = await user.matchPassword(password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const token = signToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_admin: user.is_admin,
        zodiac_sign: user.zodiac_sign,
        undertone: user.undertone,
        season: user.season,
        aesthetic_result: user.aesthetic_result,
        style_result: user.style_result
      },
      needs_password_change: password === DEFAULT_PASSWORD
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/check-default
export const checkDefaultPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() }).select('+password');
    if (!user) return res.json({ has_default_password: false });

    const isDefault = await user.matchPassword(DEFAULT_PASSWORD);
    res.json({ has_default_password: isDefault });
  } catch {
    res.json({ has_default_password: false });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ authenticated: false, user: null });
  }
  res.status(200).json({
    authenticated: true,
    user: req.user
  });
};