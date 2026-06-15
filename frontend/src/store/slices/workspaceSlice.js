import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchWorkspaces = createAsyncThunk('workspace/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/workspaces');
    return res.data.data.workspaces;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchWorkspace = createAsyncThunk('workspace/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/workspaces/${id}`);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createWorkspace = createAsyncThunk('workspace/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/workspaces', data);
    return res.data.data.workspace;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateWorkspace = createAsyncThunk('workspace/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/workspaces/${id}`, data);
    return res.data.data.workspace;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    workspaces: [],
    currentWorkspace: null,
    members: [],
    stats: null,
    userRole: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentWorkspace: (state, action) => { state.currentWorkspace = action.payload; },
    clearCurrentWorkspace: (state) => { state.currentWorkspace = null; state.members = []; state.stats = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => { state.loading = true; })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => { state.loading = false; state.workspaces = action.payload; })
      .addCase(fetchWorkspaces.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchWorkspace.pending, (state) => { state.loading = true; })
      .addCase(fetchWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkspace = action.payload.workspace;
        state.members = action.payload.members;
        state.stats = action.payload.stats;
        state.userRole = action.payload.userRole;
      })
      .addCase(fetchWorkspace.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.workspaces.unshift(action.payload);
      })

      .addCase(updateWorkspace.fulfilled, (state, action) => {
        state.currentWorkspace = action.payload;
        const idx = state.workspaces.findIndex(w => w._id === action.payload._id);
        if (idx !== -1) state.workspaces[idx] = action.payload;
      });
  },
});

export const { setCurrentWorkspace, clearCurrentWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
