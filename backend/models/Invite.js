import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const inviteSchema = new mongoose.Schema(
  {
    token: { type: String, default: uuidv4, unique: true },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    email: { type: String, required: true, lowercase: true },
    role: {
      type: String,
      enum: ["admin", "manager", "member", "guest"],
      default: "member",
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    acceptedAt: { type: Date },
  },
  { timestamps: true },
);

inviteSchema.index({ workspace: 1, email: 1 });
inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Invite", inviteSchema);
