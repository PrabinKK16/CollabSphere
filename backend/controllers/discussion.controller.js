import Discussion from '../models/Discussion.js';

const createDiscussion = async (req, res) => {
  try {
    const { title, content, workspaceId, projectId, tags } = req.body;

    const discussion = await Discussion.create({
      title, content,
      author: req.user._id,
      workspace: workspaceId || null,
      project: projectId || null,
      tags: tags || []
    });

    await discussion.populate('author', 'fullName avatar username designation');

    const io = req.app.get('io');
    if (workspaceId) io?.to(`workspace:${workspaceId}`).emit('discussion:created', discussion);

    res.status(201).json({ success: true, data: { discussion } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDiscussions = async (req, res) => {
  try {
    const { workspaceId, projectId, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (workspaceId) filter.workspace = workspaceId;
    if (projectId) filter.project = projectId;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const discussions = await Discussion.find(filter)
      .populate('author', 'fullName avatar username')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Discussion.countDocuments(filter);

    res.json({ success: true, data: { discussions, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId)
      .populate('author', 'fullName avatar username designation');

    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    discussion.viewCount += 1;
    await discussion.save();

    res.json({ success: true, data: { discussion } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });
    if (discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    Object.assign(discussion, req.body);
    await discussion.save();

    res.json({ success: true, data: { discussion } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDiscussion = async (req, res) => {
  try {
    await Discussion.findByIdAndDelete(req.params.discussionId);
    res.json({ success: true, message: 'Discussion deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createDiscussion, getDiscussions, getDiscussion, updateDiscussion, deleteDiscussion };
