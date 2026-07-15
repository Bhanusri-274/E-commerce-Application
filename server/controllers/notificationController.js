const asyncHandler    = require("express-async-handler");
const Notification    = require("../models/Notification");

// @route GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notes = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, data: notes });
});

// @route PUT /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  const note = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );
  res.json({ success: true, data: note });
});

// @route PUT /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: "All notifications marked as read" });
});

// @route DELETE /api/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ success: true, message: "Notification deleted" });
});

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
