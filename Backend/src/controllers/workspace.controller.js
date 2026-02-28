import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Workspace from "../models/workspace.models.js";
import { generateSlug } from "../utils/generateSlug.js";

export const createWorkspace = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthenticated");
  }

  let { name = "", description = "" } = req.body;

  name = name.trim();

  if (!name) {
    throw new ApiError(400, "Workspace name is required");
  }

  if (name.length < 3) {
    throw new ApiError(400, "Workspace name must be at least 3 characters");
  }

  if (name.length > 100) {
    throw new ApiError(400, "Workspace name must not exceed 100 characters");
  }

  const slug = generateSlug(name);

  if (!slug) {
    throw new ApiError(400, "Invalid workspace name");
  }

  const existing = await Workspace.findOne({ slug });
  if (existing) {
    throw new ApiError(409, "Workspace with this name already exists");
  }

  const workspace = await Workspace.create({
    name,
    description,
    slug,
    owner: userId,
    members: [
        {
            user: userId, 
            role: "owner", 
            joinedAt: new Date(), 
        }
    ],
    createdBy: userId,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, { workspace }, "Workspace created successfully")
    );
});
