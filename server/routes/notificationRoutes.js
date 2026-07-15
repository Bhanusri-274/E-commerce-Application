const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getNotifications, markRead, markAllRead, deleteNotification } = require("../controllers/notificationController");

const router = express.Router();
router.use(protect);

router.get("/",                  getNotifications);
router.put("/read-all",          markAllRead);
router.put("/:id/read",         markRead);
router.delete("/:id",            deleteNotification);

module.exports = router;
