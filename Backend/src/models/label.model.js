import mongoose from "mongoose";

export const LABEL_PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#64748b",
  "#78716c",
];

const labelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      minLength: [2, "Label name must be at least 2 characters"],
      maxLength: [50, "Label name must not exceed 50 characters"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      maxLength: [200, "Label description must not exceed 200 characters"],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      required: true,
      enum: LABEL_PRESET_COLORS,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

const Label = mongoose.model("Label", labelSchema);
export default Label;
