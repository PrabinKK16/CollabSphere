import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchNotifications = createAsyncThunk('notification/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/notifications', { params });
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markNotificationRead = createAsyncThunk('notification/markRead', async (id, { rejectWithValue }) => {
  try {
    await api.put(`/notifications/${id}/read`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markAllNotificationsRead = createAsyncThunk('notification/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.put('/notifications/read-all');
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [],
    unreadCount: 0,
    total: 0,
    loading: false,
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.total = action.payload.total;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = state.notifications.find(n => n._id === action.payload);
        if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
