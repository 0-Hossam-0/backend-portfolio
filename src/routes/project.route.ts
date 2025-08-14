import { Router } from 'express';
import {
  checkIfProjectExist,
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
  validateRequest,
} from '../middlewares/projects.middleware';
import { upload } from '../multer/multer.config';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', requireAuth, upload.array('images', 15), validateRequest, checkIfProjectExist, createProject);

router.put('/:title', requireAuth, upload.array('images', 15), validateRequest, checkIfProjectExist, updateProject);

router.get('/', getProjects);

router.get('/:title', getProject);

router.delete('/:title', requireAuth, checkIfProjectExist, deleteProject);

export default router;
