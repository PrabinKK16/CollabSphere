import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.models.js";
import { validateEmail } from "../utils/ValidateEmail.js";
import ApiResponse from "../utils/ApiResponse.js";
import { generateRefreshToken } from "../utils/generateRefreshToken.js";
import { generateAccessToken } from "./../utils/generateAccessToken.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
});

export const register = asyncHandler(async (req, res) => {
  let { userName = "", fullName = "", email = "", password = "" } = req.body;

  userName = userName.trim().toLowerCase();
  fullName = fullName.trim();
  email = email.trim().toLowerCase();

  if (!userName) {
    throw new ApiError(400, "Username is required");
  }

  if (!fullName) {
    throw new ApiError(400, "Full name is required");
  }

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  if (!validateEmail(email)) {
    throw new ApiError(400, "Email is invalid");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be atleast 8 characters");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existingUser?.email === email) {
    throw new ApiError(409, "Email already in use");
  }

  if (existingUser?.userName === userName) {
    throw new ApiError(409, "Username is already taken");
  }

  const user = await User.create({
    userName,
    fullName,
    email,
    password,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const createdUser = user.toObject();
  delete createdUser.password;
  delete createdUser.refreshToken;

  return res
    .status(201)
    .cookie("refreshToken", refreshToken, cookieOptions())
    .json(
      new ApiResponse(
        201,
        { user: createdUser, accessToken },
        "User registered and logged in successfully."
      )
    );
});

export const login = asyncHandler(async (req, res) => {
  let { email = "", password = "" } = req.body;

  email = email.trim().toLowerCase();

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  if (!validateEmail(email)) {
    throw new ApiError(400, "Email is invalid");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = user.toObject();
  delete loggedInUser.password;
  delete loggedInUser.refreshToken;

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions())
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "User login successfully."
      )
    );
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 },
  });

  return res
    .status(200)
    .clearCookie("refreshToken", cookieOptions())
    .json(new ApiResponse(200, {}, "User logout successfully."));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized");
  }

  let decoded;

  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id).select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }
  if (!user.refreshToken) {
    throw new ApiError(401, "Refresh token revoked");
  }
  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh token already used or expired");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateAccessToken(user);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions())
    .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User fetched successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  let { fullName, bio, timezone } = req.body;

  const updates = {};

  if (fullName !== undefined) {
    fullName = fullName.trim();
    if (!fullName) {
      throw new ApiError(400, "Full name cannot be empty");
    }
    if (fullName.length > 100) {
      throw new ApiError(400, "Full name too long");
    }
    updates.fullName = fullName;
  }

  if (bio !== undefined) {
    bio = bio.trim();
    if (bio.length > 300) {
      throw new ApiError(400, "Bio must not exceed 300 characters");
    }
    updates.bio = bio;
  }

  if (timezone !== undefined) {
    timezone = timezone.trim();
    if (!timezone) throw new ApiError(400, "Timezone cannot be empty");
    updates.timezone = timezone;
  }

  if (Object.entries(updates).length == 0) {
    throw new ApiError(400, "No valid fields provided to update");
  }

  const user = await User.findOneAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Profile updated successfully"));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword = "", newPassword = "", confirmPassword = "" } = req.body;

  if (!oldPassword) {
    throw new ApiError(400, "Old password is required");
  }

  if (!newPassword) {
    throw new ApiError(400, "New password is required");
  }

  if (!confirmPassword) {
    throw new ApiError(400, "Confirm password is required");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Password do not match");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(400, "New password must be different from old password");
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect old password");
  }

  user.password = newPassword;
  user.refreshToken = undefined;
  await user.save();

  return res
    .status(200)
    .clearCookie("refreshToken", cookieOptions())
    .json(new ApiResponse(200, {}, "Password changed. Please log in again."));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  let { email = "" } = req.body;

  email = email.trim().toLowerCase();

  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  if (!validateEmail(email)) {
    throw new ApiError(400, "Email is invalid");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If that email exists, a reset link has been sent"
        )
      );
  }

  const rawToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const devPayload =
    process.env.NODE_ENV !== "production" ? { resetToken: rawToken } : {};

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        devPayload,
        "If that email exists, a reset link has been sent"
      )
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token = "", newPassword = "", confirmPassword = "" } = req.body;

  if (!token) {
    throw new ApiError(400, "Reset token is required");
  }

  if (!newPassword) {
    throw new ApiError(400, "New password is required");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: Date.now() },
  }).select("+password +passwordResetExpiry +passwordResetToken");

  if (!user) {
    throw new ApiError(400, "Reset token is invalid or has expired");
  }

  user.password = newPassword;
  user.refreshToken = undefined;
  user.passwordResetExpiry = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  return res
    .status(200)
    .json(200, {}, "Password reset successfully. Please log in.");
});
