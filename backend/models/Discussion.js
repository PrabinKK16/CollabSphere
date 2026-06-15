import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  tags: [{ type: String }],
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  reactions: [{
    emoji: { type: String },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  attachments: [{
    name: { type: String },
    url: { type: String },
    publicId: { type: String },
    type: { type: String }
  }]
}, { timestamps: true });

discussionSchema.index({ workspace: 1, createdAt: -1 });
discussionSchema.index({ project: 1, createdAt: -1 });

export default mongoose.model('Discussion', discussionSchema);
