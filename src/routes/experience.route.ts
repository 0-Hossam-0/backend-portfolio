import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  checkIfExperienceExist,
  createExperience,
  deleteExperience,
  getExperiences,
  updateExperience,
  validateRequest,
} from '../middlewares/experience.middleware';

const router = Router();

router.post('/', requireAuth, validateRequest, checkIfExperienceExist, createExperience);

router.put(
  '/:title',
  requireAuth,
  validateRequest,
  checkIfExperienceExist,
  updateExperience
);

router.get('/', getExperiences);

router.get('/:title', requireAuth, getExperiences);

router.delete('/:title', requireAuth, checkIfExperienceExist, deleteExperience);

export default router;
