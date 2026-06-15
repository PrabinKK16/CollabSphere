import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: [
      'workspace_created', 'workspace_updated', 'workspace_deleted',
      'member_added', 'member_removed', 'role_changed',
      'project_created', 'project_updated', 'project_archived', 'project_deleted',
      'task_created', 'task_updated', 'task_deleted', 'task_assigned',
      'task_status_changed', 'task_completed',
      'comment_added', 'comment_edited', 'comment_deleted',
      'file_uploaded', 'file_deleted',
      'discussion_created', 'discussion_updated',
      'milestone_created', 'milestone_completed'
    ],
    required: true
  },
  description: { type: String, required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

activityLogSchema.index({ workspace: 1, createdAt: -1 });
activityLogSchema.index({ project: 1, createdAt: -1 });
activityLogSchema.index({ actor: 1, createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
