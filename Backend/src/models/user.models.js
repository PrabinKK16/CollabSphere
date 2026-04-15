import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const oauthProviderSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["google", "github"],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      select: false,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    bio: {
      type: String,
      maxLength: 300,
      default: "",
      trim: true,
    },
    timezone: {
      type: String,
      default: "UTC",
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpiry: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpiry: {
      type: Date,
      select: false,
    },
    oauthProviders: {
      type: [oauthProviderSchema],
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateEmailVerificationToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return rawToken;
};

userSchema.methods.generatePasswordVerificationToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000);
  return rawToken;
};

userSchema.methods.hasOAuthProvider = function (provider) {
  return this.oauthProviders?.some((p) => p.provider === provider) ?? false;
};

const User = mongoose.model("User", userSchema);
export default User;
