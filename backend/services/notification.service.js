import Notification from '../models/Notification.js';

const createNotification = async (io, { recipient, sender, type, title, message, data }) => {
  const notification = await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    data
  });

  const populated = await notification.populate('sender', 'fullName avatar username');

  if (io) {
    io.to(`user:${recipient}`).emit('notification:new', populated);
  }

  return populated;
};

const createBulkNotifications = async (io, notifications) => {
  const created = await Notification.insertMany(notifications);

  if (io) {
    for (const notif of created) {
      io.to(`user:${notif.recipient}`).emit('notification:new', notif);
    }
  }

  return created;
};

export { createNotification, createBulkNotifications };
