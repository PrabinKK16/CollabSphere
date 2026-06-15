import Project from '../models/Project.js';
import Task from '../models/Task.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import { logActivity } from '../services/activity.service.js';

const createProject = async (req, res) => {
  try {
    const { name, description, workspaceId, priority, startDate, endDate, color, icon, members } = req.body;

    const isMember = await WorkspaceMember.findOne({ workspace: workspaceId, user: req.user._id, isActive: true });
    if (!isMember || ['guest'].includes(isMember.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    const project = await Project.create({
      name,
      description,
      workspace: workspaceId,
      owner: req.user._id,
      priority: priority || 'medium',
      startDate,
      endDate,
      color: color || '#059669',
      icon: icon || '📁',
      members: [{ user: req.user._id, role: 'manager' }, ...(members || []).map(m => ({ user: m.userId, role: m.role || 'member' }))]
    });

    await project.populate('owner', 'fullName avatar username');

    await logActivity({
      actor: req.user._id,
      action: 'project_created',
      description: `Created project "${name}"`,
      workspace: workspaceId,
      project: project._id,
      req
    });

    const io = req.app.get('io');
    io?.to(`workspace:${workspaceId}`).emit('project:created', project);

    res.status(201).json({ success: true, data: { project } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { status, priority, search, page = 1, limit = 20 } = req.query;

    const filter = {
      workspace: workspaceId,
      isArchived: false,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const projects = await Project.find(filter)
      .populate('owner', 'fullName avatar username')
      .populate('members.user', 'fullName avatar username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const projectsWithStats = await Promise.all(projects.map(async (project) => {
      const totalTasks = await Task.countDocuments({ project: project._id, isArchived: false, parent: null });
      const completedTasks = await Task.countDocuments({ project: project._id, status: 'done', isArchived: false, parent: null });
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      return { ...project.toObject(), taskStats: { total: totalTasks, completed: completedTasks }, progress };
    }));

    const total = await Project.countDocuments(filter);

    res.json({ success: true, data: { projects: projectsWithStats, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'fullName avatar email username')
      .populate('members.user', 'fullName avatar email username designation');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const totalTasks = await Task.countDocuments({ project: project._id, isArchived: false, parent: null });
    const completedTasks = await Task.countDocuments({ project: project._id, status: 'done', isArchived: false });
    const overdueTasks = await Task.countDocuments({
      project: project._id, isArchived: false,
      dueDate: { $lt: new Date() }, status: { $ne: 'done' }
    });

    const isMember = project.members.find(m => m.user._id.toString() === req.user._id.toString());
    const userRole = isMember?.role || (project.owner._id.toString() === req.user._id.toString() ? 'manager' : 'member');

    res.json({
      success: true,
      data: {
        project,
        userRole,
        stats: { totalTasks, completedTasks, overdueTasks, progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updates = req.body;

    const project = await Project.findByIdAndUpdate(projectId, updates, { new: true })
      .populate('owner', 'fullName avatar username')
      .populate('members.user', 'fullName avatar username');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    await logActivity({
      actor: req.user._id,
      action: 'project_updated',
      description: `Updated project "${project.name}"`,
      workspace: project.workspace,
      project: project._id,
      req
    });

    const io = req.app.get('io');
    io?.to(`project:${projectId}`).emit('project:updated', project);

    res.json({ success: true, data: { project } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const archiveProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      { isArchived: true, status: 'archived' },
      { new: true }
    );

    res.json({ success: true, data: { project } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.projectId);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const exists = project.members.find(m => m.user.toString() === userId);
    if (exists) return res.status(400).json({ success: false, message: 'User already a member' });

    project.members.push({ user: userId, role: role || 'member' });
    await project.save();
    await project.populate('members.user', 'fullName avatar username');

    res.json({ success: true, data: { members: project.members } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createProject, getProjects, getProject, updateProject, archiveProject, deleteProject, addProjectMember };
