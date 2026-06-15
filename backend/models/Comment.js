import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true, maxlength: 5000 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reactions: [{
    emoji: { type: String },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  attachments: [{
    name: { type: String },
    url: { type: String },
    publicId: { type: String },
    type: { type: String }
  }],
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

commentSchema.index({ task: 1, createdAt: -1 });
commentSchema.index({ discussion: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

export default mongoose.model('Comment', commentSchema);
