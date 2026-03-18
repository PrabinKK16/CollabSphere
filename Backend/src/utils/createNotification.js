import Notification from "../models/notification.models.js";

export const createNotification = async ({
  user,
  type,
  message,
  workspace = null,
  triggeredBy = null,
}) => {
  try {
    await Notification.create({
      user,
      type,
      message,
      workspace,
      triggeredBy,
    });
  } catch (error) {
    console.error("Notification error: ", error.message);
  }
};
