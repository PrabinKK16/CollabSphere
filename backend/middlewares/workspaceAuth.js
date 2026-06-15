import WorkspaceMember from '../models/WorkspaceMember.js';
import Workspace from '../models/Workspace.js';

const ROLE_HIERARCHY = {
  owner: 5,
  admin: 4,
  manager: 3,
  member: 2,
  guest: 1
};

const checkWorkspaceAccess = (minRole = 'guest') => {
  return async (req, res, next) => {
    try {
      const workspaceId = req.params.workspaceId || req.body.workspace;

      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace || !workspace.isActive) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
      }

      const member = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: req.user._id,
        isActive: true
      });

      if (!member) {
        return res.status(403).json({ success: false, message: 'Not a member of this workspace' });
      }

      if (ROLE_HIERARCHY[member.role] < ROLE_HIERARCHY[minRole]) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }

      req.workspace = workspace;
      req.workspaceMember = member;
      req.userRole = member.role;
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

const isWorkspaceOwnerOrAdmin = checkWorkspaceAccess('admin');
const isWorkspaceManager = checkWorkspaceAccess('manager');
const isWorkspaceMember = checkWorkspaceAccess('member');
const isWorkspaceGuest = checkWorkspaceAccess('guest');

export { checkWorkspaceAccess, isWorkspaceOwnerOrAdmin, isWorkspaceManager, isWorkspaceMember, isWorkspaceGuest, ROLE_HIERARCHY };
