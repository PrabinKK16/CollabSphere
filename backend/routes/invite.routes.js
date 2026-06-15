import express from 'express';
const router = express.Router();
import { createInvite, acceptInvite, getInviteInfo } from '../controllers/invite.controller.js';
import { protect } from '../middlewares/auth.js';
router.get('/:token', getInviteInfo);
router.use(protect);
router.post('/', createInvite);
router.post('/:token/accept', acceptInvite);
export default router;
