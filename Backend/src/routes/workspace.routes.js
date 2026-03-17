import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceBySlug,
  updateWorkspace,
  archiveWorkspace,
  inviteMember,
  acceptInvite,
  rejectInvite,
  getMyInvites,
  removeMember,
  leaveWorkspace,
  updateMemberRole,
  transferOwnership,
} from "../controllers/workspace.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/invites/me", getMyInvites);
router.post("/", createWorkspace);
router.get("/", getUserWorkspaces);
router.get("/:slug", getWorkspaceBySlug);
router.patch("/:slug", updateWorkspace);
router.patch("/:slug/archive", archiveWorkspace);
router.post("/:slug/invite", inviteMember);
router.post("/:slug/accept", acceptInvite);
router.post("/:slug/reject", rejectInvite);
router.delete("/:slug/remove-member", removeMember);
router.delete("/:slug/leave", leaveWorkspace);
router.patch("/:slug/update-role", updateMemberRole);
router.patch("/:slug/transfer-ownership", transferOwnership);

export default router;
