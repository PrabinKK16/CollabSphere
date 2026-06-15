import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId || req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, designation, department, skills, location, timezone, phone, socialLinks } = req.body;

    const user = await User.findById(req.user._id);

    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (designation !== undefined) user.designation = designation;
    if (department !== undefined) user.department = department;
    if (skills) user.skills = skills;
    if (location !== undefined) user.location = location;
    if (timezone) user.timezone = timezone;
    if (phone !== undefined) user.phone = phone;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };

    await user.save();

    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const user = await User.findById(req.user._id);

    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'collabsphere/avatars',
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }]
    });

    user.avatar = result.secure_url;
    user.avatarPublicId = result.public_id;
    await user.save();

    res.json({ success: true, data: { avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationPreferences: req.body },
      { new: true }
    );
    res.json({ success: true, data: { notificationPreferences: user.notificationPreferences } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q, workspaceId } = req.query;
    if (!q) return res.json({ success: true, data: { users: [] } });

    const users = await User.find({
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    }).select('fullName avatar username email designation').limit(10);

    res.json({ success: true, data: { users } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getProfile, updateProfile, uploadAvatar, changePassword, updateNotificationPreferences, searchUsers };
