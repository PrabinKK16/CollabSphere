import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import ActivityLog from "../models/activityLog.models";
import Workspace from "../models/workspace.models.js";

export const getWorkspaceActivity = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { slug = "" } = req.params;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!slug.trim()) {
    throw new ApiError(400, "Worksapce slug is required");
  }

  const workspace = await Workspace.findOne({
    slug: slug.trim().toLowerCase(),
    isArchived: false,
    "member.user": userId,
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found or access denied");
  }

  const logs = await ActivityLog.find({
    workspace: workspace._id,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("performedBy", "userName email")
    .populate("targetUser", "userName email");

  return res
    .status(200)
    .json(new ApiResponse(200, { logs }, "Activity fetched successfully"));
});
