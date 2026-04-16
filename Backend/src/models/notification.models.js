import mongoose from "mongoose";

export const NOTIFICATION_TYPES = [
  "invite_received",
  "invite_accepted",
  "invite_rejected",
  "member_removed",
  "role_updated",
  "ownership_transferred",
  "task_assigned",
  "task_unassigned",
  "task_due_soon",
  "task_overdue",
  "task_completed",
  "task_moved",
  "comment_added",
  "mention",
];

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxLength: 500,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      index: true,
      default: null,
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
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
