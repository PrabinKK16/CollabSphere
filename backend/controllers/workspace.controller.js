import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { logActivity } from '../services/activity.service.js';

const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
};

const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = generateSlug(name);

    const workspace = await Workspace.create({
      name,
      slug,
      description,
      owner: req.user._id
    });

    await WorkspaceMember.create({
      workspace: workspace._id,
      user: req.user._id,
      role: 'owner',
      invitedBy: req.user._id
    });

    await logActivity({
      actor: req.user._id,
      action: 'workspace_created',
      description: `Created workspace "${name}"`,
      workspace: workspace._id,
      req
    });

    const io = req.app.get('io');
    io?.to(`user:${req.user._id}`).emit('workspace:created', workspace);

    res.status(201).json({ success: true, data: { workspace } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const memberships = await WorkspaceMember.find({ user: req.user._id, isActive: true })
      .populate('workspace')
      .sort({ createdAt: -1 });

    const workspaces = memberships
      .filter(m => m.workspace && m.workspace.isActive)
      .map(m => ({ ...m.workspace.toObject(), userRole: m.role }));

    res.json({ success: true, data: { workspaces } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId).populate('owner', 'fullName avatar email');

    const members = await WorkspaceMember.find({ workspace: workspace._id, isActive: true })
      .populate('user', 'fullName avatar email username designation')
      .sort({ role: 1 });

    const projectCount = await Project.countDocuments({ workspace: workspace._id, isArchived: false });
    const activeProjects = await Project.countDocuments({ workspace: workspace._id, status: 'active', isArchived: false });
    const completedProjects = await Project.countDocuments({ workspace: workspace._id, status: 'completed' });

    res.json({
      success: true,
      data: {
        workspace,
        members,
        userRole: req.userRole,
        stats: { memberCount: members.length, projectCount, activeProjects, completedProjects }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const { name, description, settings } = req.body;
    const workspace = req.workspace;

    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    if (settings) workspace.settings = { ...workspace.settings, ...settings };

    await workspace.save();

    await logActivity({
      actor: req.user._id,
      action: 'workspace_updated',
      description: `Updated workspace "${workspace.name}"`,
      workspace: workspace._id,
      req
    });

    res.json({ success: true, data: { workspace } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadWorkspaceLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const workspace = req.workspace;

    if (workspace.logoPublicId) {
      await deleteFromCloudinary(workspace.logoPublicId);
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'collabsphere/workspace-logos',
      transformation: [{ width: 200, height: 200, crop: 'fill' }]
    });

    workspace.logo = result.secure_url;
    workspace.logoPublicId = result.public_id;
    await workspace.save();

    res.json({ success: true, data: { logo: workspace.logo } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWorkspaceMembers = async (req, res) => {
  try {
    const members = await WorkspaceMember.find({ workspace: req.params.workspaceId, isActive: true })
      .populate('user', 'fullName avatar email username designation lastSeen')
      .populate('invitedBy', 'fullName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { members } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { memberId, role } = req.body;

    if (req.userRole !== 'owner' && req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    const member = await WorkspaceMember.findOne({
      workspace: req.params.workspaceId,
      user: memberId
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (member.role === 'owner') {
      return res.status(403).json({ success: false, message: 'Cannot change owner role' });
    }

    member.role = role;
    await member.save();

    await logActivity({
      actor: req.user._id,
      action: 'role_changed',
      description: `Changed member role to ${role}`,
      workspace: req.params.workspaceId,
      req
    });

    const io = req.app.get('io');
    io?.to(`user:${memberId}`).emit('workspace:role_changed', { workspaceId: req.params.workspaceId, role });

    res.json({ success: true, data: { member } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (req.userRole !== 'owner' && req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    const member = await WorkspaceMember.findOne({
      workspace: req.params.workspaceId,
      user: memberId
    });

    if (!member || member.role === 'owner') {
      return res.status(400).json({ success: false, message: 'Cannot remove this member' });
    }

    member.isActive = false;
    await member.save();

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    if (req.userRole !== 'owner') {
      return res.status(403).json({ success: false, message: 'Only workspace owner can delete it' });
    }

    const workspace = req.workspace;
    workspace.isActive = false;
    await workspace.save();

    res.json({ success: true, message: 'Workspace deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createWorkspace, getWorkspaces, getWorkspace, updateWorkspace, uploadWorkspaceLogo, getWorkspaceMembers, updateMemberRole, removeMember, deleteWorkspace };
