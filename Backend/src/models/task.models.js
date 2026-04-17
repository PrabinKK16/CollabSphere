import mongoose from "mongoose";

export const TASK_PRIORITIES = ["none", "low", "medium", "high", "urgent"];
export const TASK_STATUSES = ["active", "completed", "archived"];

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: {
      type: String,
      maxLength: [2000, "Comment must not exceed 2000 characters"],
      trim: true,
      required: true,
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 255,
    },
    mimeType: {
      type: String,
      default: "application/octet-stream",
    },
    size: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const taskLabelSchema = new mongoose.Schema(
  {
    label: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Label",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: [2, "Task title must be at least 2 characters"],
      maxLength: [255, "Task title must not exceed 255 characters"],
    },
    description: {
      type: String,
      default: "",
      maxLength: [10000, "Description must not exceed 10,000 characters"],
    },
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: {
      type: [commentSchema],
      default: [],
      validator: {
        validate: (arr) => arr.length <= 200,
        message: "A task cannot have more than 200 comments",
      },
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
      validator: {
        validate: (arr) => arr.length <= 20,
        message: "A task cannot have more than 20 attachments",
      },
    },
    labels: {
      type: [taskLabelSchema],
      default: [],
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "active",
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: "none",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    isArchieved: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    attachmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    assignees: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
      validator: {
        validate: (arr) => arr.length <= 10,
        message: "A task cannot have more than 10 assignees",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
