import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../store/slices/notificationSlice';
import { setOnlineUsers } from '../store/slices/uiSlice';
import { moveTaskKanban, addTaskToKanban, removeTaskFromKanban } from '../store/slices/taskSlice';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const { accessToken, isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => console.log('Socket connected'));
    socket.on('disconnect', () => console.log('Socket disconnected'));

    socket.on('notification:new', (notification) => {
      dispatch(addNotification(notification));
    });

    socket.on('users:online', (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on('task:created', (task) => {
      dispatch(addTaskToKanban(task));
    });

    socket.on('task:deleted', ({ taskId }) => {
      dispatch(removeTaskFromKanban(taskId));
    });

    socket.on('task:dragged', ({ taskId, status, order, fromStatus }) => {
      dispatch(moveTaskKanban({ taskId, fromStatus, toStatus: status, newOrder: order }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, accessToken, dispatch]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
