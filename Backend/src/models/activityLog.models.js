import mongoose from "mongoose";

export const ACTIVITY_TYPES = [
  "workspace_created",
  "workspace_updated",
  "workspace_archived",
  "member_invited",
  "member_reinvited",
  "member_joined",
  "member_removed",
  "member_left",
  "role_updated",
  "ownership_transferred",
  "board_created",
  "board_updated",
  "board_deleted",
  "task_created",
  "task_updated",
  "task_deleted",
  "task_assigned",
  "task_unassigned",
  "task_completed",
  "task_reopened",
  "task_moved",
  "task_due_date_set",
  "task_priority_changed",
  "comment_added",
  "comment_deleted",
  "label_added",
  "label_removed",
];

const activityLogSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      index: true,
      default: null,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      index: true,
      default: null,
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
      default: null,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, versionKey: false }
);

activityLogSchema.index({ workspace: 1, createdAt: -1 });
activityLogSchema.index({ performedBy: 1 });
activityLogSchema.index({ workspace: 1, action: 1 });
activityLogSchema.index({ board: 1, createdAt: -1 });
activityLogSchema.index({ task: 1, createdAt: -1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
