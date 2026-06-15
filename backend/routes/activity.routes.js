import express from 'express';
const router = express.Router();
import { getActivities } from '../controllers/activity.controller.js';
import { protect } from '../middlewares/auth.js';
router.use(protect);
router.get('/', getActivities);
export default router;
