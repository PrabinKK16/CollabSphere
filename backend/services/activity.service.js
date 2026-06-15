import ActivityLog from '../models/ActivityLog.js';

const logActivity = async ({ actor, action, description, workspace, project, task, metadata, req }) => {
  try {
    return await ActivityLog.create({
      actor,
      action,
      description,
      workspace,
      project,
      task,
      metadata,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent']
    });
  } catch (error) {
    console.error('Activity log error:', error.message);
  }
};

export { logActivity };
