import { Router } from 'express';
import {
  authStatus,
  checkIfUserExist,
  requireAuth,
  userLogin,
  userLogout,
  validateRequest,
} from '../middlewares/auth.middleware';
import { createUser } from '../middlewares/user.middleware';

const router = Router();

router.post('/', validateRequest, createUser);

router.post('/login', userLogin);

router.get('/logout', requireAuth, userLogout);

router.get('/auth', authStatus);

// router.put('/:title', validateRequest, checkIfProjectExist, updateProject);

// router.get('/login', validateRequest);

// router.delete('/:title', checkIfProjectExist, deleteProject);

export default router;
