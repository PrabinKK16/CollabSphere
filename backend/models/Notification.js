import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: [
      'task_assigned', 'task_updated', 'task_completed', 'task_commented',
      'project_created', 'project_updated', 'project_completed',
      'mention_received', 'role_changed', 'member_invited',
      'workspace_updated', 'comment_added', 'file_uploaded', 'discussion_created'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    discussionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' },
    link: { type: String }
  },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
