import mongoose, { mongo } from "mongoose";

export const BOARD_VISIBILITY = ["workspace", "private"];
export const DEFAULT_COLUMNS = [
  { name: "Backlog", order: 0, color: "#94a3b8" },
  { name: "To Do", order: 1, color: "#60a5fa" },
  { name: "In Progress", order: 2, color: "#f59e0b" },
  { name: "In Review", order: 3, color: "#a78bfa" },
  { name: "Done", order: 4, color: "#34d399" },
];

const columnSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxLength: [50, "Column name must not exceed 50 characters"],
    },
    order: {
      type: Number,
      default: 0,
      required: true,
    },
    color: {
      type: String,
      default: null,
      match: [
        /^#([A-Fa-f0-9]{6})$/,
        "Color must be a valid hex color (e.g. #6366f1)",
      ],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    wipLimit: {
      type: Number,
      default: null,
      min: [1, "WIP limit must be at least 1"],
    },
    isCompletionColumn: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [2, "Workspace name must be atleast 2 characters"],
      maxLength: [100, "Workspace name must not exceed 100 characters"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxLength: [500, "Description must not exceed 500 characters"],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    coverUrl: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "workspace",
      required: true,
      index: true,
    },
    emoji: {
      type: String,
      default: null,
      maxLength: [8, "Emoji must be a single emoji character"],
      trim: true,
    },
    columns: {
      type: [columnSchema],
      default: [],
      validate: {
        validator: function (cols) {
          return cols.length <= 20;
        },
        message: "A board cannot have more than 20 columns",
      },
    },
    privateMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    visibility: {
      type: String,
      enum: BOARD_VISIBILITY,
      default: "workspace",
    },
    taskCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedTaskCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

boardSchema.index({ workspace: 1, isArchived: 1 });
boardSchema.index({ workspace: 1, createdBy: 1 });
boardSchema.index(
  { name: "text", description: "text" },
  { weights: { name: 10, description: 3 }, name: "board_text_search" }
);

boardSchema.virtual("completionRate").get(function () {
  if (!this.taskCount || this.taskCount === 0) return 0;
  return Math.round((this.completedTaskCount / this.taskCount) * 100);
});

boardSchema.virtual("activeColumns").get(function () {
  return (this.columns || [])
    .filter((c) => !c.isArchived)
    .sort((a, b) => a.order - b.order);
});

boardSchema.methods.getColumn = function (columnId) {
  return this.columns.id(columnId) ?? null;
};

boardSchema.methods.canAccess = function (userId, workspaceMemberRole) {
  const isPrivileged = ["owner", "admin"].includes(workspaceMemberRole);
  if (isPrivileged) return true;
  if (this.visibility === "workspace") return true;

  const uid = userId.toString();
  if (this.createdBy.toString() === uid) return true;
  return this.privateMembers.some((m) => m.toString() === uid);
};

const Board = mongoose.model("Board", boardSchema);
export default Board;
