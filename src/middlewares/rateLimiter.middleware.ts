import rateLimit from 'express-rate-limit';
import { Request } from 'express';


export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});


export const emailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 Mins
  max: 2, // limit each key to 5 requests per windowMs
  message: { message: 'Too many email requests. Please try again later.' },
  standardHeaders: true, // Return RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  keyGenerator: (req: Request) => {
    // Prefer session user id when available, otherwise fallback to IP
    // This requires that session middleware runs before this limiter
    // (and that you set `app.set('trust proxy', 1)` if behind a proxy)
    return (req as any).session?.user?.id ?? req.ip;
  },
});