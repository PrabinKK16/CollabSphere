import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 5000 },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['backlog', 'todo', 'in_progress', 'review', 'testing', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  labels: [{ type: String }],
  dueDate: { type: Date },
  startDate: { type: Date },
  estimatedHours: { type: Number },
  loggedHours: { type: Number, default: 0 },
  checklist: [{
    text: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: { type: Date }
  }],
  attachments: [{
    name: { type: String },
    url: { type: String },
    publicId: { type: String },
    type: { type: String },
    size: { type: Number },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  sprint: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' },
  milestone: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' },
  order: { type: Number, default: 0 },
  isArchived: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { timestamps: true });

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ workspace: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ parent: 1 });

export default mongoose.model('Task', taskSchema);
