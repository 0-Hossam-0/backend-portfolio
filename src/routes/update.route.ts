import { Router } from 'express';
import { upload } from '../multer/multer.config';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  checkIfUpdateExist,
  createUpdate,
  deleteUpdate,
  getUpdate,
  getUpdates,
  modifyUpdate,
  validateRequest,
} from '../middlewares/update.middleware';

const router = Router();

router.post('/', requireAuth, upload.array('images', 5), validateRequest, checkIfUpdateExist, createUpdate);

router.put('/:title', requireAuth, upload.array('images', 5), validateRequest, checkIfUpdateExist, modifyUpdate);

router.get('/', getUpdates);

router.get('/:title', checkIfUpdateExist, getUpdate);

router.delete('/:title', requireAuth, checkIfUpdateExist, deleteUpdate);

export default router;
