import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.models.js";
import validateEmail from "../utils/ValidateEmail.js";
import ApiResponse from "../utils/ApiResponse.js";
import { generateRefreshToken } from "../utils/generateRefreshToken.js";
import { generateAccessToken } from "./../utils/generateAccessToken.js";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
});

export const register = asyncHandler(async (req, res) => {
  let { userName = "", fullName = "", email = "", password = "" } = req.body;

  userName = userName.trim();
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

  const user = await User.findOne({ email }).select("+password");
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

export const refreshAccessToken = asyncHandler(async (req, res) => {});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  return res.status(200).json(new ApiResponse(200, { user }));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword = "", newPassword = "", confirmPassword = "" } = req.body;

  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!oldPassword) {
    throw new ApiError(400, "Old Password is required");
  }

  if (!newPassword) {
    throw new ApiError(400, "New Password is required");
  }

  if (!confirmPassword) {
    throw new ApiError(400, "Confirm Password is required");
  }

  const existingUser = await User.findById(req.user._id).select("+password");
  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await existingUser.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect old password");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(400, "New password must be different");
  }

  existingUser.password = newPassword;
  existingUser.refreshToken = undefined;
  await existingUser.save();

  return res
    .status(200)
    .clearCookie("refreshToken", cookieOptions())
    .json(new ApiResponse(200, {}, "Password updated successfully. Please login again."));
});
