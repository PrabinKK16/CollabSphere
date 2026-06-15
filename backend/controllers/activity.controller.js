import ActivityLog from '../models/ActivityLog.js';

const getActivities = async (req, res) => {
  try {
    const { workspaceId, projectId, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (workspaceId) filter.workspace = workspaceId;
    if (projectId) filter.project = projectId;

    const activities = await ActivityLog.find(filter)
      .populate('actor', 'fullName avatar username')
      .populate('project', 'name color')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(filter);

    res.json({ success: true, data: { activities, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getActivities };
