import ActivityLog from "../models/activityLog.models.js";

export const createActivityLog = async ({
  workspace,
  action,
  performedBy,
  targetUser = null,
  meta = {},
}) => {
  try {
    await ActivityLog.create({
      workspace,
      action,
      performedBy,
      targetUser,
      meta,
    });
  } catch (error) {
    console.error("ActivityLog error: ", error.message);
  }
};
