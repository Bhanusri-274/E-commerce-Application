const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// @route GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const query = { role: "customer" };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(query),
  ]);

  res.json({ success: true, data: users, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});

// @route PUT /api/admin/users/:id/block
const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ success: true, data: user });
});

// @route DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await user.deleteOne();
  res.json({ success: true, message: "User removed" });
});

module.exports = { getUsers, toggleBlockUser, deleteUser };
