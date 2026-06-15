import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchKanbanTasks = createAsyncThunk('task/fetchKanban', async ({ projectId, params }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/tasks/project/${projectId}/kanban`, { params });
    return res.data.data.columns;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchTasks = createAsyncThunk('task/fetchAll', async ({ projectId, params }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/tasks/project/${projectId}`, { params });
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchTask = createAsyncThunk('task/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/tasks/${id}`);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createTask = createAsyncThunk('task/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/tasks', data);
    return res.data.data.task;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateTask = createAsyncThunk('task/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/tasks/${id}`, data);
    return res.data.data.task;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateTaskStatus = createAsyncThunk('task/updateStatus', async ({ id, status, order }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/tasks/${id}/status`, { status, order });
    return res.data.data.task;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteTask = createAsyncThunk('task/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/tasks/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const taskSlice = createSlice({
  name: 'task',
  initialState: {
    tasks: [],
    kanbanColumns: null,
    currentTask: null,
    subtasks: [],
    total: 0,
    loading: false,
    kanbanLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentTask: (state) => { state.currentTask = null; state.subtasks = []; },
    moveTaskKanban: (state, action) => {
      const { taskId, fromStatus, toStatus, newOrder } = action.payload;
      if (!state.kanbanColumns) return;
      const fromCol = state.kanbanColumns[fromStatus];
      const taskIdx = fromCol?.findIndex(t => t._id === taskId);
      if (taskIdx === -1 || taskIdx === undefined) return;
      const [task] = fromCol.splice(taskIdx, 1);
      task.status = toStatus;
      const toCol = state.kanbanColumns[toStatus] || [];
      toCol.splice(newOrder, 0, task);
      state.kanbanColumns[toStatus] = toCol;
    },
    addTaskToKanban: (state, action) => {
      const task = action.payload;
      if (state.kanbanColumns?.[task.status]) {
        state.kanbanColumns[task.status].unshift(task);
      }
    },
    removeTaskFromKanban: (state, action) => {
      const taskId = action.payload;
      if (!state.kanbanColumns) return;
      Object.keys(state.kanbanColumns).forEach(col => {
        state.kanbanColumns[col] = state.kanbanColumns[col].filter(t => t._id !== taskId);
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKanbanTasks.pending, (state) => { state.kanbanLoading = true; })
      .addCase(fetchKanbanTasks.fulfilled, (state, action) => { state.kanbanLoading = false; state.kanbanColumns = action.payload; })
      .addCase(fetchKanbanTasks.rejected, (state, action) => { state.kanbanLoading = false; state.error = action.payload; })

      .addCase(fetchTasks.pending, (state) => { state.loading = true; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.total = action.payload.total;
      })
      .addCase(fetchTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchTask.pending, (state) => { state.loading = true; })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload.task;
        state.subtasks = action.payload.subtasks || [];
      })
      .addCase(fetchTask.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
        if (state.kanbanColumns?.[action.payload.status]) {
          state.kanbanColumns[action.payload.status].unshift(action.payload);
        }
      })

      .addCase(updateTask.fulfilled, (state, action) => {
        state.currentTask = action.payload;
        const idx = state.tasks.findIndex(t => t._id === action.payload._id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })

      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
      });
  },
});

export const { clearCurrentTask, moveTaskKanban, addTaskToKanban, removeTaskFromKanban } = taskSlice.actions;
export default taskSlice.reducer;
