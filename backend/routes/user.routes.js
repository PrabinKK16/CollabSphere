import express from 'express';
const router = express.Router();
import { getProfile, updateProfile, uploadAvatar, changePassword, updateNotificationPreferences, searchUsers } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

router.use(protect);
router.get('/search', searchUsers);
router.get('/profile/:userId', getProfile);
router.put('/profile', updateProfile);
router.put('/avatar', upload.single('avatar'), uploadAvatar);
router.put('/change-password', changePassword);
router.put('/notification-preferences', updateNotificationPreferences);

export default router;
