import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import ActivityLog from '../models/ActivityLog.js';

const getWorkspaceAnalytics = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { period = '30' } = req.query;
    const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const [
      totalProjects, activeProjects, completedProjects,
      totalTasks, completedTasks, overdueTasks,
      memberCount, recentActivities
    ] = await Promise.all([
      Project.countDocuments({ workspace: workspaceId, isArchived: false }),
      Project.countDocuments({ workspace: workspaceId, status: 'active', isArchived: false }),
      Project.countDocuments({ workspace: workspaceId, status: 'completed' }),
      Task.countDocuments({ workspace: workspaceId, isArchived: false, parent: null }),
      Task.countDocuments({ workspace: workspaceId, status: 'done', isArchived: false }),
      Task.countDocuments({ workspace: workspaceId, isArchived: false, dueDate: { $lt: new Date() }, status: { $ne: 'done' } }),
      WorkspaceMember.countDocuments({ workspace: workspaceId, isActive: true }),
      ActivityLog.find({ workspace: workspaceId, createdAt: { $gte: daysAgo } })
        .populate('actor', 'fullName avatar username')
        .sort({ createdAt: -1 })
        .limit(20)
    ]);

    const tasksByStatus = await Task.aggregate([
      { $match: { workspace: mongoose.Types.ObjectId.createFromHexString(workspaceId), isArchived: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const tasksByPriority = await Task.aggregate([
      { $match: { workspace: mongoose.Types.ObjectId.createFromHexString(workspaceId), isArchived: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const taskTrend = await Task.aggregate([
      {
        $match: {
          workspace: mongoose.Types.ObjectId.createFromHexString(workspaceId),
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          created: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const completionTrend = await Task.aggregate([
      {
        $match: {
          workspace: mongoose.Types.ObjectId.createFromHexString(workspaceId),
          status: 'done',
          completedAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          completed: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: { totalProjects, activeProjects, completedProjects, totalTasks, completedTasks, overdueTasks, memberCount },
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        tasksByStatus,
        tasksByPriority,
        taskTrend,
        completionTrend,
        recentActivities
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProjectAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { period = '30' } = req.query;
    const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);
    const mongooseId = mongoose.Types.ObjectId.createFromHexString(projectId);

    const [totalTasks, completedTasks, overdueTasks] = await Promise.all([
      Task.countDocuments({ project: projectId, isArchived: false, parent: null }),
      Task.countDocuments({ project: projectId, status: 'done', isArchived: false }),
      Task.countDocuments({ project: projectId, isArchived: false, dueDate: { $lt: new Date() }, status: { $ne: 'done' } })
    ]);

    const tasksByStatus = await Task.aggregate([
      { $match: { project: mongooseId, isArchived: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const tasksByAssignee = await Task.aggregate([
      { $match: { project: mongooseId, isArchived: false } },
      { $unwind: '$assignees' },
      { $group: { _id: '$assignees', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.fullName', avatar: '$user.avatar', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const completionTrend = await Task.aggregate([
      { $match: { project: mongooseId, status: 'done', completedAt: { $gte: daysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: { totalTasks, completedTasks, overdueTasks },
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        tasksByStatus,
        tasksByAssignee,
        completionTrend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getWorkspaceAnalytics, getProjectAnalytics };
