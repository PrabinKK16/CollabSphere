import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Workspace from "../models/workspace.models.js";
import { generateSlug } from "../utils/generateSlug.js";
import User from "../models/user.models.js";

const WORKSPACE_ROLES = ["owner", "admin", "member", "guest"];

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
