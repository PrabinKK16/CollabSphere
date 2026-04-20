// Backend/src/routes/board.routes.js

import { Router } from "express";
import {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  archiveBoard,
  addColumn,
  updateColumn,
  reorderColumns,
  archiveColumn,
} from "../controllers/board.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

// mergeParams: true is critical here.
// This router is mounted under /api/v1/workspaces/:slug/boards in app.js.
// Without mergeParams, req.params.slug from the parent router would be
// invisible inside this child router — every getWorkspaceForUser() call
// would receive slug as undefined and throw a 404.
const router = Router({ mergeParams: true });

router.use(verifyJWT);

router.post("/", createBoard);
router.get("/", getBoards);
router.get("/:boardId", getBoardById);
router.patch("/:boardId", updateBoard);
router.patch("/:boardId/archive", archiveBoard);

router.post("/:boardId/columns", addColumn);
router.patch("/:boardId/columns/reorder", reorderColumns);
router.patch("/:boardId/columns/:columnId", updateColumn);
router.patch("/:boardId/columns/:columnId/archive", archiveColumn);

export default router;
