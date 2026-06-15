import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 2000 },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['manager', 'member', 'guest'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['planning', 'active', 'on_hold', 'completed', 'archived'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  startDate: { type: Date },
  endDate: { type: Date },
  color: { type: String, default: '#059669' },
  icon: { type: String, default: '📁' },
  isArchived: { type: Boolean, default: false },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  tags: [{ type: String }],
  settings: {
    isPublic: { type: Boolean, default: false },
    allowGuestComments: { type: Boolean, default: false }
  }
}, { timestamps: true });

projectSchema.index({ workspace: 1, status: 1 });
projectSchema.index({ owner: 1 });

export default mongoose.model('Project', projectSchema);
