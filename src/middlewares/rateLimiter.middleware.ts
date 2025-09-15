import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { Request } from 'express';


export const emailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 2,
  message: { message: 'Too many email requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req as any).session?.user?.id ?? ipKeyGenerator(req.ip!);
  },
});


export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
