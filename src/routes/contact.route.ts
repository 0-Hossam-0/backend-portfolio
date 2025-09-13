import { Router } from 'express';
import {
  createContactInfo,
  getContactInfo,
  sendEmail,
  updateContactInfo,
  validateContactMe,
  validateRequest,
} from '../middlewares/contact.middleware';
import { requireAuth } from '../middlewares/auth.middleware';
import { emailLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/', validateRequest, createContactInfo);

router.put('/', requireAuth, validateRequest, updateContactInfo);

router.get('/', getContactInfo);

router.post('/send-email', emailLimiter, validateContactMe, sendEmail);

export default router;
