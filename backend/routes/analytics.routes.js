import express from 'express';
const router = express.Router();
import { getWorkspaceAnalytics, getProjectAnalytics } from '../controllers/analytics.controller.js';
import { protect } from '../middlewares/auth.js';
router.use(protect);
router.get('/workspace/:workspaceId', getWorkspaceAnalytics);
router.get('/project/:projectId', getProjectAnalytics);
export default router;
