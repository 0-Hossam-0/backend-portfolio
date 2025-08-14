import { Router } from 'express';
import { checkPersonalExists, createOrUpdatePersonalInfo, getPersonalInfo } from '../middlewares/personal.middleware';
import { upload } from '../multer/multer.config';

const router = Router();

router.get('/', getPersonalInfo);

router.put(
  "/",
  upload.single("image"),
  checkPersonalExists,
  createOrUpdatePersonalInfo
);

export default router;
