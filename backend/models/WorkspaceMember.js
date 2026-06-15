import mongoose from 'mongoose';

const workspaceMemberSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'member', 'guest'],
    default: 'member'
  },
  joinedAt: { type: Date, default: Date.now },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

workspaceMemberSchema.index({ workspace: 1, user: 1 }, { unique: true });
workspaceMemberSchema.index({ workspace: 1, role: 1 });

export default mongoose.model('WorkspaceMember', workspaceMemberSchema);
