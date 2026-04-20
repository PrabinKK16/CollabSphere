import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "./../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Board, {
  BOARD_VISIBILITY,
  DEFAULT_COLUMNS,
} from "../models/board.models.js";
import Workspace from "./../models/workspace.models.js";
import { createActivityLog } from "../utils/createActivityLog.js";

const getWorkspaceForUser = async (slug, userId, requiredRoles = []) => {
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

  if (requiredRoles.length > 0) {
    const member = workspace.members.find(
      (m) => m.user.toString() === userId.toString() && m.status === "accepted"
    );
    if (!member || !requiredRoles.includes(member.role)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action"
      );
    }
  }

  return workspace;
};

export const createBoard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { slug } = req.params;
  let { name = "", description = "", color, emoji, visibility } = req.body;

  name = name.trim();
  if (!name) {
    throw new ApiError(400, "Board name is required");
  }
  if (name.length < 2) {
    throw new ApiError(400, "Board name must be at least 2 characters");
  }
  if (name.length > 100) {
    throw new ApiError(400, "Board name must not exceed 100 characters");
  }

  if (visibility && !BOARD_VISIBILITY.includes(visibility)) {
    throw new ApiError(400, "Invalid visibility value");
  }

  const workspace = await getWorkspaceForUser(slug, userId, [
    "owner",
    "admin",
    "member",
  ]);

  const seededColumns = DEFAULT_COLUMNS.map((col) => ({
    ...col,
    createdBy: userId,
  }));

  const board = await Board.create({
    name,
    description: description.trim(),
    createdBy: userId,
    color: color || "#6366f1",
    emoji: emoji || null,
    workspace: workspace._id,
    columns: seededColumns,
    visibility: visibility || "workspace",
  });

  await Workspace.updateOne(
    { _id: workspace._id },
    { $inc: { boardCount: 1 } }
  );

  await createActivityLog({
    workspace: workspace._id,
    board: board._id,
    performedBy: userId,
    action: "board_created",
    meta: { boardName: board.name },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { board }, "Board created successfully"));
});

export const getBoards = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { slug } = req.params;

  const workspace = await getWorkspaceForUser(slug, userId);

  const boards = await Board.find({
    workspace: workspace._id,
    isArchived: false,
  })
    .select("-columns")
    .sort({ createdAt: -1 })
    .populate("createdBy", "userName fullName avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, { boards }, "Boards fetched successfully"));
});

export const getBoardById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { slug, boardId } = req.params;

  const workspace = await getWorkspaceForUser(slug, userId);

  const board = await Board.findOne({
    _id: boardId,
    workspace: workspace._id,
    isArchived: false,
  }).populate("createdBy", "userName fullName avatar");

  if (!board) {
    throw new ApiError(404, "Board not found");
  }

  board.columns = board.columns
    .filter((c) => !c.isArchived)
    .sort((a, b) => a.order - b.order);

  return res
    .status(200)
    .json(new ApiResponse(200, { board }, "Board fetched successfully"));
});

export const updateBoard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { slug, boardId } = req.params;
  let { name, description, color, emoji, visibility } = req.body;

  const workspace = await getWorkspaceForUser(slug, userId, [
    "owner",
    "admin",
    "member",
  ]);

  const board = await Board.findOne({
    _id: boardId,
    workspace: workspace._id,
    isArchived: false,
  });

  if (!board) {
    throw new ApiError(404, "Board not found");
  }

  const member = workspace.members.find(
    (m) => m.user.toString() === userId.toString() && m.status === "accepted"
  );

  const isPrivileged = ["owner", "admin"].includes(member.role);
  const isCreator = board.createdBy.toString() === userId.toString();

  if (!isPrivileged && !isCreator) {
    throw new ApiError(403, "You do not have permission to update this board");
  }

  if (name !== undefined) {
    name = name.trim();
    if (!name) {
      throw new ApiError(400, "Board name is required");
    }
    if (name.length < 2) {
      throw new ApiError(400, "Board name must be at least 2 characters");
    }
    if (name.length > 100) {
      throw new ApiError(400, "Board name must not exceed 100 characters");
    }
    board.name = name;
  }

  if (description !== undefined) {
    board.description = description.trim();
  }

  if (emoji !== undefined) {
    board.emoji = emoji || null;
  }

  if (color !== undefined) {
    board.color = color || "#6366f1";
  }

  if (visibility !== undefined) {
    if (!BOARD_VISIBILITY.includes(visibility)) {
      throw new ApiError(400, "Invalid visibility value");
    }
    board.visibility = visibility;
  }

  await board.save();

  await createActivityLog({
    workspace: workspace._id,
    board: board._id,
    action: "board_updated",
    performedBy: userId,
    meta: { boardName: board.name },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { board }, "Board updated successfully"));
});

export const archiveBoard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { slug, boardId } = req.params;

  const workspace = await getWorkspaceForUser(slug, userId, ["owner", "admin"]);

  const board = await Board.findOne({
    _id: boardId,
    workspace: workspace._id,
    isArchived: false,
  });

  if (!board) {
    throw new ApiError(404, "Board not found");
  }

  board.isArchived = true;
  await board.save();

  await Workspace.updateOne(
    { _id: workspace._id },
    { $inc: { boardCount: -1 } }
  );

  await createActivityLog({
    workspace: workspace._id,
    board: board._id,
    action: "board_archived",
    performedBy: userId,
    meta: { boardName: board.name },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Board archived successfully"));
});
