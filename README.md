# CelestiCare Final (MERN Stack)
Assistive Healthcare, Equipment, and Requisitions Management Platform.

## Environment setup

Copy `server/.env.example` to `server/.env` for local development and set each placeholder from your secret manager. Never commit `.env` files or put database, JWT, or SMTP credentials in frontend variables. The backend uses `API_PUBLIC_URL` to create verification links, `BREVO_SMTP_USER` for the Brevo SMTP login, `BREVO_SMTP_PASS` for its SMTP key, and `MAIL_FROM` for a sender verified with Brevo.

For Render, configure the same backend variables in the service dashboard. Set `NODE_ENV=production`, `API_PUBLIC_URL` to the Render service URL, and `ALLOWED_ORIGINS` to a comma-separated list of exact frontend origins. Include the production Vercel domain and each Vercel Preview domain that should be allowed; preview origins are intentionally not accepted by wildcard.

The frontend reads `VITE_API_BASE_URL` at build time. Keep `client/.env.development` pointed at `http://localhost:5000/api`. In Vercel, set `VITE_API_BASE_URL` to the Render API URL ending in `/api` for both the Production and Preview environment scopes. A Vercel Preview URL is a frontend origin, not an API server, so do not use it as the API base URL. Add each preview site's origin to Render's `ALLOWED_ORIGINS` so the emailed verification link can return to that same site.

New registrations remain unverified until the one-time link is opened. Verification tokens are stored as hashes, expire after 24 hours, and are cleared after use. Login and protected API routes reject unverified accounts. Existing records without `isVerified` remain usable during rollout; new registrations explicitly set it to `false`.

The credentials previously shared in chat should be rotated before deployment: replace the MongoDB database user's password, issue a fresh JWT secret, and rotate the Brevo SMTP key. Update the local and Render secret stores only after rotation.