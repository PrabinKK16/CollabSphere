import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import ActivityLog from "../models/activityLog.models.js";
import Workspace from "../models/workspace.models.js";
import { getPagination } from "../utils/pagination.js";

export const getWorkspaceActivity = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { slug = "" } = req.params;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!slug.trim()) {
    throw new ApiError(400, "Workspace slug is required");
  }

  const workspace = await Workspace.findOne({
    slug: slug.trim().toLowerCase(),
    isArchived: false,
    "members.user": userId,
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found or access denied");
  }

  const { page, limit, skip } = getPagination(req);

  const [logs, total] = await Promise.all([
    ActivityLog.find({
      workspace: workspace._id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("performedBy", "userName")
      .populate("targetUser", "userName")
      .lean(),

    ActivityLog.countDocuments({ workspace: workspace._id }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Activity fetched successfully"
    )
  );
});
