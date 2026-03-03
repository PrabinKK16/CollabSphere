import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Workspace from "../models/workspace.models.js";
import { generateSlug } from "../utils/generateSlug.js";
import { hasWorkspacePermission } from "../utils/hasWorkspacePermission.js";

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
      },
    ],
    createdBy: userId,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, { workspace }, "Workspace created successfully")
    );
});

export const getUserWorkspaces = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const workspaces = await Workspace.find({
    "members.user": userId,
    isArchived: false,
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { workspaces }, "Workspaces fetched successfully")
    );
});

export const getWorkspaceBySlug = asyncHandler(async (req, res) => {
  const { slug = "" } = req.params;
  const userId = req.user?._id;

  if (!slug.trim()) {
    throw new ApiError(400, "Workspace slug is required");
  }

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const workspace = await Workspace.find({
    slug: slug.trim().toLowerCase(),
    isArchived: false,
    "members.user": userId,
  });
  if (!workspace) {
    throw new ApiResponse(404, "Workspace not found or access denied");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { workspace }, "Workspace fetched successfully")
    );
});

export const updateWorkspace = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { slug = "" } = req.params;
  let { name, description } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!slug.trim()) {
    throw new ApiError(400, "Workspace slug is required");
  }

  const workspace = await Workspace.find({
    slug: slug.trim().toLowerCase(),
    isArchived: false,
    "member.user": userId,
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found or access denied");
  }

  const hasPermission = hasWorkspacePermission(workspace, userId, [
    "owner",
    "admin",
  ]);

  if (!hasPermission) {
    throw new ApiError(403, "Forbidden");
  }

  if (name !== undefined) {
    name = name.trim();

    if (!name) {
      throw new ApiError(400, "Workspace name cannot be empty");
    }

    if (name.length < 3) {
      throw new ApiError(400, "Workspace name must be at least 3 characters");
    }

    if (name.length > 100) {
      throw new ApiError(400, "Workspace name must not exceed 100 characters");
    }

    const newSlug = generateSlug(name);

    if (!newSlug) {
      throw new ApiError(400, "Invalid workspace name");
    }

    const existing = await Workspace.findOne({ slug: newSlug });
    if (existing && existing._id.toString() !== workspace._id.toString()) {
      throw new ApiError(409, "Workspace name already in use");
    }

    workspace.name = name;
    workspace.slug = newSlug;
  }

  if (description !== undefined) {
    workspace.description = description;
  }

  await workspace.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { workspace }, "Workspace updated successfully")
    );
});

export const addMember = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { slug = "" } = req.params;
  const { email, role = "member" } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!slug.trim()) {
    throw new ApiError(400, "Workspace slug is required");
  }

  const workspace = await Workspace.find({
    slug: slug.trim().toLowerCase(),
    isArchived: false,
    "members.user": userId,
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found or access denied");
  }

  const hasPermission = hasWorkspacePermission(workspace, userId, [
    "owner",
    "admin",
  ]);

  if (!hasPermission) {
    throw new ApiError(403, "Forbidden");
  }
});
