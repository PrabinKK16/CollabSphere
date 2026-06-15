import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  originalName: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  isPublic: { type: Boolean, default: false },
  downloadCount: { type: Number, default: 0 }
}, { timestamps: true });

fileSchema.index({ workspace: 1, createdAt: -1 });
fileSchema.index({ project: 1 });
fileSchema.index({ uploadedBy: 1 });

export default mongoose.model('File', fileSchema);
