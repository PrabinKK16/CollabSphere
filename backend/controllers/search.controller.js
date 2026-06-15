import Task from '../models/Task.js';
import Project from '../models/Project.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import User from '../models/User.js';
import Discussion from '../models/Discussion.js';

const globalSearch = async (req, res) => {
  try {
    const { q, workspaceId, type } = req.query;

    if (!q || q.length < 2) {
      return res.json({ success: true, data: { results: {} } });
    }

    const regex = { $regex: q, $options: 'i' };

    const userWorkspaces = await WorkspaceMember.find({ user: req.user._id, isActive: true }).select('workspace');
    const workspaceIds = workspaceId ? [workspaceId] : userWorkspaces.map(m => m.workspace);

    const userProjects = await Project.find({
      workspace: { $in: workspaceIds },
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
    }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    const results = {};

    if (!type || type === 'tasks') {
      results.tasks = await Task.find({ project: { $in: projectIds }, title: regex, isArchived: false })
        .populate('project', 'name color')
        .populate('assignees', 'fullName avatar')
        .select('title status priority dueDate project assignees')
        .limit(10);
    }

    if (!type || type === 'projects') {
      results.projects = await Project.find({
        workspace: { $in: workspaceIds },
        name: regex, isArchived: false,
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
      })
        .populate('owner', 'fullName avatar')
        .select('name status priority color icon workspace')
        .limit(10);
    }

    if (!type || type === 'discussions') {
      results.discussions = await Discussion.find({ workspace: { $in: workspaceIds }, title: regex })
        .populate('author', 'fullName avatar')
        .select('title author createdAt workspace project')
        .limit(10);
    }

    if (!type || type === 'members') {
      const memberUserIds = await WorkspaceMember.find({ workspace: { $in: workspaceIds }, isActive: true }).select('user');
      results.members = await User.find({
        _id: { $in: memberUserIds.map(m => m.user) },
        $or: [{ fullName: regex }, { username: regex }, { email: regex }]
      })
        .select('fullName avatar username email designation')
        .limit(10);
    }

    res.json({ success: true, data: { results, query: q } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { globalSearch };
