import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const onlineUsers = new Map();

const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('fullName avatar username email');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, { socketId: socket.id, user: socket.user, lastSeen: new Date() });

    socket.join(`user:${userId}`);
    io.emit('users:online', Array.from(onlineUsers.keys()));

    socket.on('workspace:join', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
      socket.to(`workspace:${workspaceId}`).emit('workspace:user_joined', {
        user: socket.user, workspaceId
      });
    });

    socket.on('workspace:leave', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
    });

    socket.on('project:join', (projectId) => {
      socket.join(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit('project:user_joined', {
        user: socket.user, projectId
      });
    });

    socket.on('project:leave', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('task:join', (taskId) => {
      socket.join(`task:${taskId}`);
    });

    socket.on('task:leave', (taskId) => {
      socket.leave(`task:${taskId}`);
    });

    socket.on('typing:start', ({ taskId, discussionId }) => {
      const room = taskId ? `task:${taskId}` : `discussion:${discussionId}`;
      socket.to(room).emit('typing:user_started', { user: socket.user });
    });

    socket.on('typing:stop', ({ taskId, discussionId }) => {
      const room = taskId ? `task:${taskId}` : `discussion:${discussionId}`;
      socket.to(room).emit('typing:user_stopped', { user: socket.user });
    });

    socket.on('task:drag', ({ taskId, status, order, projectId }) => {
      socket.to(`project:${projectId}`).emit('task:dragged', { taskId, status, order });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });
  });
};

const getOnlineUsers = () => Array.from(onlineUsers.keys());

export { initializeSocket, getOnlineUsers };
