import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Notification from "../models/notification.models.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(20);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { notifications },
        "Notifications fetched successfully"
      )
    );
});

export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { id } = req.params;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res.status(200).json(new ApiResponse(200, {}, "Marked as read"));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { id } = req.params;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const notification = await Notification.findOneAndDelete({
    _id: id,
    user: userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res.status(200).json(new ApiResponse(200, {}, "Notification deleted"));
});
