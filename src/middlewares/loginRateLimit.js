import { HttpError } from '../utils/HttpError.js';

// Minimal in-memory brute-force guard for the single login endpoint:
// MAX_FAILURES failed attempts per IP within WINDOW_MS, then 429 until it expires.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;
const failures = new Map();

export const loginRateLimit = (req, res, next) => {
  const now = Date.now();
  const entry = failures.get(req.ip);
  if (entry && entry.resetAt <= now) {
    failures.delete(req.ip);
  } else if (entry && entry.count >= MAX_FAILURES) {
    return next(new HttpError(429, 'Too many login attempts, try again later'));
  }

  res.on('finish', () => {
    if (res.statusCode !== 401) return;
    const current = failures.get(req.ip) ?? { count: 0, resetAt: now + WINDOW_MS };
    current.count += 1;
    failures.set(req.ip, current);
  });
  next();
};
