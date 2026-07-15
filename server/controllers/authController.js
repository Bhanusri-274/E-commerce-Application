const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc Register a new customer
// @route POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name, email, password, phone });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

// @desc Login user / admin
// @route POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  if (user.isBlocked) {
    res.status(403);
    throw new Error("Your account has been blocked. Contact support.");
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    },
  });
});

// @desc Get logged in user profile
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// @desc Forgot password - generate reset token
// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404);
    throw new Error("No account found with this email");
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  // In production this token would be emailed to the user.
  res.json({
    success: true,
    message: "Password reset token generated",
    resetToken, // exposed here only because no email service is configured
  });
});

// @desc Reset password using token
// @route PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Reset token is invalid or has expired");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successful", token: generateToken(user._id) });
});

// @desc Change password (logged in)
// @route PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  const { currentPassword, newPassword } = req.body;

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: "Password updated successfully" });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
};
