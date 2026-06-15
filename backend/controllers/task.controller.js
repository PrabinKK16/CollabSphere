import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { createNotification } from '../services/notification.service.js';
import { logActivity } from '../services/activity.service.js';

const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignees, priority, status, dueDate, labels, parent } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const task = await Task.create({
      title,
      description,
      project: projectId,
      workspace: project.workspace,
      reporter: req.user._id,
      assignees: assignees || [],
      priority: priority || 'medium',
      status: status || 'todo',
      dueDate,
      labels: labels || [],
      parent: parent || null
    });

    await task.populate([
      { path: 'assignees', select: 'fullName avatar email username' },
      { path: 'reporter', select: 'fullName avatar email username' }
    ]);

    if (assignees && assignees.length > 0) {
      for (const assigneeId of assignees) {
        if (assigneeId.toString() !== req.user._id.toString()) {
          await createNotification(req.app.get('io'), {
            recipient: assigneeId,
            sender: req.user._id,
            type: 'task_assigned',
            title: 'New Task Assigned',
            message: `${req.user.fullName} assigned you to "${title}"`,
            data: { projectId, taskId: task._id, workspaceId: project.workspace, link: `/projects/${projectId}/tasks/${task._id}` }
          });
        }
      }
    }

    await logActivity({
      actor: req.user._id,
      action: 'task_created',
      description: `Created task "${title}"`,
      workspace: project.workspace,
      project: projectId,
      task: task._id,
      req
    });

    const io = req.app.get('io');
    io?.to(`project:${projectId}`).emit('task:created', task);

    res.status(201).json({ success: true, data: { task } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignee, search, label, page = 1, limit = 50 } = req.query;

    const filter = { project: projectId, isArchived: false };
    if (!req.query.includeSubtasks) filter.parent = null;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignees = assignee;
    if (label) filter.labels = label;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(filter)
      .populate('assignees', 'fullName avatar email username')
      .populate('reporter', 'fullName avatar username')
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(filter);

    res.json({ success: true, data: { tasks, total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignees', 'fullName avatar email username designation')
      .populate('reporter', 'fullName avatar username')
      .populate('parent', 'title status')
      .populate('dependencies', 'title status priority');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const subtasks = await Task.find({ parent: task._id, isArchived: false })
      .populate('assignees', 'fullName avatar username');

    res.json({ success: true, data: { task, subtasks } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const oldStatus = task.status;

    if (updates.status && updates.status === 'done' && oldStatus !== 'done') {
      updates.completedAt = new Date();
    }

    Object.assign(task, updates);
    await task.save();

    await task.populate([
      { path: 'assignees', select: 'fullName avatar email username' },
      { path: 'reporter', select: 'fullName avatar username' }
    ]);

    if (updates.status && updates.status !== oldStatus) {
      await logActivity({
        actor: req.user._id,
        action: 'task_status_changed',
        description: `Changed task "${task.title}" status from ${oldStatus} to ${updates.status}`,
        workspace: task.workspace,
        project: task.project,
        task: task._id,
        req
      });
    }

    const io = req.app.get('io');
    io?.to(`project:${task.project}`).emit('task:updated', task);

    if (updates.assignees) {
      for (const assigneeId of updates.assignees) {
        if (assigneeId.toString() !== req.user._id.toString()) {
          await createNotification(req.app.get('io'), {
            recipient: assigneeId,
            sender: req.user._id,
            type: 'task_updated',
            title: 'Task Updated',
            message: `${req.user.fullName} updated task "${task.title}"`,
            data: { taskId: task._id, projectId: task.project, workspaceId: task.workspace }
          });
        }
      }
    }

    res.json({ success: true, data: { task } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, order } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const oldStatus = task.status;
    task.status = status;
    if (order !== undefined) task.order = order;
    if (status === 'done' && oldStatus !== 'done') task.completedAt = new Date();
    await task.save();

    const io = req.app.get('io');
    io?.to(`project:${task.project}`).emit('task:status_updated', { taskId, status, order });

    res.json({ success: true, data: { task } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.isArchived = true;
    await task.save();

    const io = req.app.get('io');
    io?.to(`project:${task.project}`).emit('task:deleted', { taskId: task._id });

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getKanbanTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { assignee, priority, label, search } = req.query;

    const filter = { project: projectId, parent: null, isArchived: false };
    if (assignee) filter.assignees = assignee;
    if (priority) filter.priority = priority;
    if (label) filter.labels = label;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(filter)
      .populate('assignees', 'fullName avatar username')
      .populate('reporter', 'fullName avatar')
      .sort({ order: 1, createdAt: -1 });

    const columns = {
      backlog: [],
      todo: [],
      in_progress: [],
      review: [],
      testing: [],
      done: []
    };

    tasks.forEach(task => {
      if (columns[task.status]) {
        columns[task.status].push(task);
      }
    });

    res.json({ success: true, data: { columns } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateChecklist = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { checklist } = req.body;

    const task = await Task.findByIdAndUpdate(taskId, { checklist }, { new: true });
    res.json({ success: true, data: { checklist: task.checklist } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createTask, getTasks, getTask, updateTask, updateTaskStatus, deleteTask, getKanbanTasks, updateChecklist };
