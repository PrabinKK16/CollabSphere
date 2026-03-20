import mongoose from "mongoose";

const ACTIVITY_TYPES = [
  "workspace_created",
  "workspace_updated",
  "workspace_archived",
  "member_invited",
  "member_joined",
  "member_removed",
  "role_updated",
  "ownership_transferred",
];

const activityLogSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: true,
      index: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, versionKey: false }
);

activityLogSchema.index({ workspace: 1, createdAt: -1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
