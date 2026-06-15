import express from 'express';
const router = express.Router();
import { createWorkspace, getWorkspaces, getWorkspace, updateWorkspace, uploadWorkspaceLogo, getWorkspaceMembers, updateMemberRole, removeMember, deleteWorkspace } from '../controllers/workspace.controller.js';
import { protect } from '../middlewares/auth.js';
import { isWorkspaceGuest, isWorkspaceOwnerOrAdmin } from '../middlewares/workspaceAuth.js';
import upload from '../middlewares/upload.js';

router.use(protect);
router.post('/', createWorkspace);
router.get('/', getWorkspaces);
router.get('/:workspaceId', isWorkspaceGuest, getWorkspace);
router.put('/:workspaceId', isWorkspaceOwnerOrAdmin, updateWorkspace);
router.put('/:workspaceId/logo', isWorkspaceOwnerOrAdmin, upload.single('logo'), uploadWorkspaceLogo);
router.get('/:workspaceId/members', isWorkspaceGuest, getWorkspaceMembers);
router.put('/:workspaceId/members/role', isWorkspaceOwnerOrAdmin, updateMemberRole);
router.delete('/:workspaceId/members/:memberId', isWorkspaceOwnerOrAdmin, removeMember);
router.delete('/:workspaceId', isWorkspaceOwnerOrAdmin, deleteWorkspace);

export default router;
