import Notification from "../models/notification.models.js";

export const createNotification = async ({
  user,
  type,
  message,
  workspace = null,
  board = null,
  task = null,
  triggeredBy = null,
  meta = {},
}) => {
  try {
    await Notification.create({
      user,
      type,
      message,
      workspace,
      board,
      task,
      triggeredBy,
      meta,
    });
  } catch (error) {
    console.error("Notification error: ", error.message);
  }
};
