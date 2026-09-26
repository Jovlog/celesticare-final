const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://celesticare-final.vercel.app'
];

export const getAllowedOrigins = () => {
  const configuredOrigins = process.env.ALLOWED_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  return configuredOrigins?.length ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS;
};

export const getAllowedRedirectOrigin = (candidate) => {
  if (!candidate) return null;

  try {
    const origin = new URL(candidate).origin;
    return getAllowedOrigins().includes(origin) ? origin : null;
  } catch {
    return null;
  }
};

const allowedOrigins = getAllowedOrigins();

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile native apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Origin '${origin}' is blocked by CORS policy.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ],
  optionsSuccessStatus: 200
};