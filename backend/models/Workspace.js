import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, maxlength: 1000 },
  logo: { type: String, default: null },
  logoPublicId: { type: String, default: null },
  banner: { type: String, default: null },
  bannerPublicId: { type: String, default: null },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  settings: {
    allowGuestAccess: { type: Boolean, default: false },
    requireApprovalForInvites: { type: Boolean, default: false },
    defaultMemberRole: { type: String, enum: ['member', 'guest'], default: 'member' }
  },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' }
}, { timestamps: true });

workspaceSchema.index({ owner: 1 });

export default mongoose.model('Workspace', workspaceSchema);