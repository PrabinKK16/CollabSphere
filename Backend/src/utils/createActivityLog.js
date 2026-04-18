import ActivityLog from "../models/activityLog.models.js";

export const createActivityLog = async ({
  workspace,
  action,
  performedBy,
  board = null,
  task = null,
  targetUser = null,
  meta = {},
  session = null,
}) => {
  const payload = {
    workspace,
    action,
    performedBy,
    board,
    task,
    targetUser,
    meta,
  };

  try {
    if (session) {
      await ActivityLog.create([payload], { session });
    } else {
      await ActivityLog.create(payload);
    }
  } catch (error) {
    console.error("ActivityLog error: ", error.message);
    throw error;
  }
};
