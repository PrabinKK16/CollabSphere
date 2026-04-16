import mongoose from "mongoose";

export const WORKSPACE_ROLES = ["owner", "admin", "member", "guest"];
export const WORKSPACE_INVITE_STATUS = ["pending", "accepted", "rejected"];
export const MANAGER_ROLES = ["owner", "admin"];
export const LEAVABLE_ROLES = ["admin", "member", "guest"];

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: WORKSPACE_ROLES,
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: null,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: WORKSPACE_INVITE_STATUS,
      default: "pending",
    },
    lastActiveAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: [3, "Workspace name must be atleast 3 characters"],
      maxLength: [100, "Workspace name must not exceed 100 characters"],
    },
    description: {
      type: String,
      maxLength: [500, "Description must not exceed 500 characters"],
      default: "",
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: [memberSchema],
    isArchived: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    emoji: {
      type: String,
      default: null,
      maxLength: [8, "Emoji must be a single emoji character"],
      trim: true,
    },
    color: {
      type: String,
      default: null,
      match: [
        /^#([A-Fa-f0-9]{6})$/,
        "Color must be a valid hex color (e.g. #6366f1)",
      ],
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    boardCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

workspaceSchema.index({ "members.user": 1 });
workspaceSchema.index({ owner: 1, isArchived: 1 });
workspaceSchema.index({ "members.user": 1, "members.status": 1 });
workspaceSchema.index({ _id: 1, "members.user": 1 }, { unique: true });
workspaceSchema.index(
  { name: "text", description: "text" },
  { weights: { name: 10, description: 3 }, name: "workspace_text_search" }
);
workspaceSchema.index({ createadAt: -1, isArchived: 1 });

workspaceSchema.virtual("memberCount").get(function () {
  if (!this.members) return 0;
  return this.members.filter((m) => m.status === "accepted").length;
});

workspaceSchema.virtual("pendingInviteCount").get(function () {
  if (!this.members) return 0;
  return this.members.filter((m) => m.status === "pending").length;
});

workspaceSchema.methods.getMemberRole = function (userId) {
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString() && m.status === "accepted"
  );
  return member?.role ?? null;
};

workspaceSchema.methods.isMember = function (userId) {
  return this.members.some(
    (m) => m.user.toString() === userId.toString() && m.status === "accepted"
  );
};

workspaceSchema.methods.hasRole = function (userId, roles = []) {
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString() && m.status === "accepted"
  );

  return member ? roles.includes(member.role) : false;
};

const Workspace = mongoose.model("Workspace", workspaceSchema);
export default Workspace;
