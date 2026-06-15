import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: null },
    avatarPublicId: { type: String, default: null },
    bio: { type: String, maxlength: 500 },
    designation: { type: String },
    department: { type: String },
    skills: [{ type: String }],
    location: { type: String },
    timezone: { type: String, default: "UTC" },
    phone: { type: String },
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      twitter: { type: String },
      website: { type: String },
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
    notificationPreferences: {
      emailNotifications: { type: Boolean, default: true },
      taskAssigned: { type: Boolean, default: true },
      taskUpdated: { type: Boolean, default: true },
      commentAdded: { type: Boolean, default: true },
      mentionReceived: { type: Boolean, default: true },
      projectUpdated: { type: Boolean, default: true },
      memberInvited: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

// Mongoose 7+ / 8+ - use async without next
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

export default mongoose.model("User", userSchema);
