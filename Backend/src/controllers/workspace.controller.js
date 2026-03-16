import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Workspace from "../models/workspace.models.js";
import { generateSlug } from "../utils/generateSlug.js";
import User from "../models/user.models.js";
import mongoose from "mongoose";

const WORKSPACE_ROLES = ["owner", "admin", "member", "guest"];
const LEAVABLE_ROLES = ["admin", "member", "guest"];

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

  const existing = await Workspace.findOne({ slug, isArchived: false });
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
        status: "accepted",
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
    isArchived: false,
    members: {
      $elemMatch: {
        user: userId,
        status: "accepted",
      },
    },
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

  const workspace = await Workspace.findOne({
    slug: slug.trim().toLowerCase(),
    isArchived: false,
    members: {
      $elemMatch: {
        user: userId,
        status: "accepted",
      },
    },
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found or access denied");
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

  const workspace = await Workspace.findOne({
    slug: slug.trim().toLowerCase(),
    isArchived: false,
    members: {
      $elemMatch: {
        user: userId,
        status: "accepted",
        role: { $in: ["owner", "admin"] },
      },
    },
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found or access denied");
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

    const existing = await Workspace.findOne({
      slug: newSlug,
      isArchived: false,
    });

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

export const archiveWorkspace = asyncHandler(async (req, res) => {
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

  const requester = workspace.members.find(
    (m) =>
      m.user.toString() === userId.toString() &&
      m.status === "accepted" &&
      m.role === "owner"
  );

  if (!requester) {
    throw new ApiError(
      403,
      "Only the workspace owner can archive the workspace"
    );
  }

  workspace.isArchived = true;

  await workspace.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Workspace archived successfully"));
});

export const inviteMember = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { slug = "" } = req.params;
  let { identifier = "", role = "member" } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!slug.trim()) {
    throw new ApiError(400, "Workspace slug is required");
  }

  identifier = identifier.trim().toLowerCase();

  if (!identifier) {
    throw new ApiError(400, "User identifier is required");
  }

  if (!WORKSPACE_ROLES.includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const workspace = await Workspace.findOne({
    slug: slug.trim().toLowerCase(),
    isArchived: false,
    members: {
      $elemMatch: {
        user: userId,
        status: "accepted",
        role: { $in: ["owner", "admin"] },
      },
    },
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found or access denied");
  }

  const targetUser = await User.findOne({
    $or: [{ email: identifier }, { userName: identifier }],
  });

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  if (targetUser._id.toString() === userId.toString()) {
    throw new ApiError(400, "You cannot invite yourself");
  }

  const existingMember = workspace.members.find(
    (m) => m.user.toString() === targetUser._id.toString()
  );

  if (existingMember) {
    if (existingMember.status !== "rejected") {
      throw new ApiError(409, "User is already invited or a member");
    }

    existingMember.status = "pending";
    existingMember.role = role;
    existingMember.invitedBy = userId;
  } else {
    workspace.members.push({
      user: targetUser._id,
      role,
      status: "pending",
      invitedBy: userId,
    });
  }

  await workspace.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Invitation sent successfully"));
});

export const acceptInvite = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { slug = "" } = req.params;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!slug.trim()) {
    throw new ApiError(400, "Workspace slug is required");
  }

  const workspace = await Workspace.findOneAndUpdate(
    {
      slug: slug.trim().toLowerCase(),
      isArchived: false,
      members: {
        $elemMatch: {
          user: userId,
          status: "pending",
        },
      },
    },
    {
      $set: {
        "members.$.status": "accepted",
        "members.$.joinedAt": new Date(),
      },
    },
    { new: true }
  );

  if (!workspace) {
    throw new ApiError(404, "Workspace not found or already processed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Invitation accepted successfully"));
});

export const rejectInvite = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { slug = "" } = req.params;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!slug.trim()) {
    throw new ApiError(400, "Workspace slug is required");
  }

  const workspace = await Workspace.findOneAndUpdate(
    {
      slug: slug.trim().toLowerCase(),
      isArchived: false,
      members: {
        $elemMatch: {
          user: userId,
          status: "pending",
        },
      },
    },
    {
      $set: {
        "members.$.status": "rejected",
      },
    },
    { new: true }
  );

  if (!workspace) {
    throw new ApiError(404, "Workspace not found or already processed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Invitation rejected successfully"));
});

export const getMyInvites = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const workspaces = await Workspace.find(
    {
      isArchived: false,
      members: {
        $elemMatch: {
          user: userId,
          status: "pending",
        },
      },
    },
    {
      name: 1,
      slug: 1,
      members: {
        $elemMatch: { user: userId },
      },
    }
  ).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { invites: workspaces },
        "Invitations fetched successfully"
      )
    );
});

export const removeMember = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { slug = "" } = req.params;
  const { targetUserId } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!slug.trim()) {
    throw new ApiError(400, "Workspace slug is required");
  }

  if (!targetUserId) {
    throw new ApiError(400, "Target user ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (targetUserId.toString() === userId.toString()) {
    throw new ApiError(
      400,
      "You cannot remove yourshelf. Use leave workspace instead."
    );
  }

  const workspace = await Workspace.findOne({
    slug: slug.trim().toLowerCase(),
    isArchived: false,
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  const requester = workspace.members.find(
    (m) => m.user.toString() === userId.toString() && m.status === "accepted"
  );

  if (!requester) {
    throw new ApiError(403, "Access denied");
  }

  const targetMember = workspace.members.find(
    (m) =>
      m.user.toString() === targetUserId.toString() && m.status === "accepted"
  );

  if (!targetMember) {
    throw new ApiError(404, "Member not found in workspace");
  }

  if (targetMember.role === "owner") {
    throw new ApiError(400, "Owner cannot be removed");
  }

  if (requester.role === "admin") {
    if (targetMember.role === "admin") {
      throw new ApiError(403, "Admin cannot remove another admin");
    }
  }

  if (!["owner", "admin"].includes(requester.role)) {
    throw new ApiError(403, "You do not have the permission to remove members");
  }

  await Workspace.updateOne(
    { _id: workspace._id },
    {
      $pull: {
        members: { user: targetUserId },
      },
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member removed successfully"));
});

export const leaveWorkspace = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { slug = "" } = req.params;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!slug.trim()) {
    throw new ApiError(400, "Workspace slug is required");
  }

  const workspace = await Workspace.findOneAndUpdate(
    {
      slug: slug.trim().toLowerCase(),
      isArchived: false,
      members: {
        $elemMatch: {
          user: userId,
          status: "accepted",
          role: { $in: LEAVABLE_ROLES },
        },
      },
    },
    {
      $pull: {
        members: { user: userId },
      },
    },
    { new: false, projection: { _id: 1 } }
  );

  if (!workspace) {
    throw new ApiError(404, "No workspace found or access denied");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User left workspace successfully"));
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { slug = "" } = req.params;
  const { targetUserId, newRole } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!slug.trim()) {
    throw new ApiError(400, "Workspace slug is required");
  }

  if (!targetUserId) {
    throw new ApiError(400, "Target user ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (!newRole) {
    throw new ApiError(400, "New role is required");
  }

  if (!WORKSPACE_ROLES.includes(newRole)) {
    throw new ApiError(400, "Invalid role");
  }

  if (newRole === "owner") {
    throw new ApiError(400, "Ownership transfer must be done separately");
  }

  if (targetUserId.toString() === userId.toString()) {
    throw new ApiError(400, "You cannot change your own role");
  }

  const workspace = await Workspace.findOne({
    slug: slug.trim().toLowerCase(),
    isArchived: false,
    "members.user": userId,
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found or access denied");
  }

  const requester = workspace.members.find(
    (m) => m.user.toString() === userId.toString() && m.status === "accepted"
  );

  if (!requester) {
    throw new ApiError(403, "Access denied");
  }

  const targetMember = workspace.members.find(
    (m) =>
      m.user.toString() === targetUserId.toString() && m.status === "accepted"
  );

  if (!targetMember) {
    throw new ApiError(404, "Member not found in workspace");
  }

  if (targetMember.role === "owner") {
    throw new ApiError(403, "Owner role cannot be modified");
  }

  if (targetMember.role === newRole) {
    throw new ApiError(400, "User already has this role");
  }

  if (
    requester.role === "admin" &&
    targetMember.role !== "member" &&
    targetMember.role !== "guest"
  ) {
    throw new ApiError(403, "Admin cannot modify this role");
  }

  if (!["owner", "admin"].includes(requester.role)) {
    throw new ApiError(403, "You do not have permission to change roles");
  }

  targetMember.role = newRole;

  await workspace.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member role updated successfully"));
});

export const transferOwnership = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { slug = "" } = req.params;
  const { targetUserId } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!slug.trim()) {
    throw new ApiError(400, "Workspace slug is required");
  }

  if (!targetUserId) {
    throw new ApiError(400, "Target user ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (targetUserId.toString() === userId.toString()) {
    throw new ApiError(400, "You are already the owner");
  }

  const workspace = await Workspace.findOne({
    slug: slug.trim().toLowerCase(),
    isArchived: false,
    "members.user": userId,
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found or access denied");
  }

  const requester = workspace.members.find(
    (m) =>
      m.user.toString() === userId.toString() &&
      m.status === "accepted" &&
      m.role === "owner"
  );

  if (!requester) {
    throw new ApiError(403, "Only the workspace owner can transfer ownership");
  }

  const targetMember = workspace.members.find(
    (m) =>
      m.user.toString() === targetUserId.toString() && m.status === "accepted"
  );

  if (!targetMember) {
    throw new ApiError(404, "Member not found in workspace");
  }

  if (targetMember.role === "owner") {
    throw new ApiError(400, "User is already the owner");
  }

  targetMember.role = "owner";
  requester.role = "admin";
  await workspace.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Ownership transferred successfully"));
});
