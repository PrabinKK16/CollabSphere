import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'missed'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Milestone', milestoneSchema);
