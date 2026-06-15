import File from '../models/File.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { logActivity } from '../services/activity.service.js';

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { workspaceId, projectId, taskId } = req.body;

    const isImage = req.file.mimetype.startsWith('image/');
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'collabsphere/files',
      resource_type: isImage ? 'image' : 'raw'
    });

    const file = await File.create({
      name: result.public_id.split('/').pop(),
      originalName: req.file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      type: isImage ? 'image' : 'document',
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      workspace: workspaceId || null,
      project: projectId || null,
      task: taskId || null
    });

    await file.populate('uploadedBy', 'fullName avatar username');

    await logActivity({
      actor: req.user._id,
      action: 'file_uploaded',
      description: `Uploaded file "${req.file.originalname}"`,
      workspace: workspaceId,
      project: projectId,
      req
    });

    res.status(201).json({ success: true, data: { file } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFiles = async (req, res) => {
  try {
    const { workspaceId, projectId, taskId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (workspaceId) filter.workspace = workspaceId;
    if (projectId) filter.project = projectId;
    if (taskId) filter.task = taskId;

    const files = await File.find(filter)
      .populate('uploadedBy', 'fullName avatar username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await File.countDocuments(filter);

    res.json({ success: true, data: { files, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await deleteFromCloudinary(file.publicId);
    await File.findByIdAndDelete(req.params.fileId);

    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { uploadFile, getFiles, deleteFile };
