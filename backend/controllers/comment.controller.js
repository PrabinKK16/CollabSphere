import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import { createNotification } from '../services/notification.service.js';

const createComment = async (req, res) => {
  try {
    const { content, taskId, discussionId, parentId, mentions } = req.body;

    const comment = await Comment.create({
      content,
      author: req.user._id,
      task: taskId || null,
      discussion: discussionId || null,
      parent: parentId || null,
      mentions: mentions || []
    });

    await comment.populate('author', 'fullName avatar username designation');

    if (taskId) {
      const task = await Task.findById(taskId).populate('assignees', '_id');
      const io = req.app.get('io');
      io?.to(`task:${taskId}`).emit('comment:created', comment);

      if (task) {
        const notifyUsers = [...new Set([
          ...task.assignees.map(a => a._id.toString()),
          task.reporter?.toString()
        ])].filter(id => id !== req.user._id.toString());

        for (const userId of notifyUsers) {
          await createNotification(io, {
            recipient: userId,
            sender: req.user._id,
            type: 'comment_added',
            title: 'New Comment',
            message: `${req.user.fullName} commented on "${task.title}"`,
            data: { taskId, projectId: task.project, link: `/projects/${task.project}/tasks/${taskId}` }
          });
        }
      }
    }

    if (mentions && mentions.length > 0) {
      const io = req.app.get('io');
      for (const mentionedId of mentions) {
        if (mentionedId !== req.user._id.toString()) {
          await createNotification(io, {
            recipient: mentionedId,
            sender: req.user._id,
            type: 'mention_received',
            title: 'You were mentioned',
            message: `${req.user.fullName} mentioned you in a comment`,
            data: { taskId, commentId: comment._id }
          });
        }
      }
    }

    res.status(201).json({ success: true, data: { comment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const { taskId, discussionId } = req.query;
    const filter = { isDeleted: false, parent: null };
    if (taskId) filter.task = taskId;
    if (discussionId) filter.discussion = discussionId;

    const comments = await Comment.find(filter)
      .populate('author', 'fullName avatar username designation')
      .populate({ path: 'parent', populate: { path: 'author', select: 'fullName avatar username' } })
      .sort({ createdAt: 1 });

    const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
      const replies = await Comment.find({ parent: comment._id, isDeleted: false })
        .populate('author', 'fullName avatar username');
      return { ...comment.toObject(), replies };
    }));

    res.json({ success: true, data: { comments: commentsWithReplies } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();
    await comment.populate('author', 'fullName avatar username');

    res.json({ success: true, data: { comment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    comment.isDeleted = true;
    comment.content = '[Comment deleted]';
    await comment.save();

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const reaction = comment.reactions.find(r => r.emoji === emoji);
    if (reaction) {
      const userIndex = reaction.users.indexOf(req.user._id);
      if (userIndex > -1) {
        reaction.users.splice(userIndex, 1);
        if (reaction.users.length === 0) {
          comment.reactions = comment.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        reaction.users.push(req.user._id);
      }
    } else {
      comment.reactions.push({ emoji, users: [req.user._id] });
    }

    await comment.save();
    res.json({ success: true, data: { reactions: comment.reactions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createComment, getComments, updateComment, deleteComment, addReaction };
