const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// @desc Update profile info
// @route PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  if (req.body.avatar) user.avatar = req.body.avatar;
  await user.save();
  res.json({ success: true, data: user });
});

// @desc Add address
// @route POST /api/users/addresses
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, data: user.addresses });
});

// @desc Update address
// @route PUT /api/users/addresses/:addressId
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  Object.assign(address, req.body);
  await user.save();
  res.json({ success: true, data: user.addresses });
});

// @desc Delete address
// @route DELETE /api/users/addresses/:addressId
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, data: user.addresses });
});

module.exports = { updateProfile, addAddress, updateAddress, deleteAddress };
