import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchProjects = createAsyncThunk('project/fetchAll', async ({ workspaceId, params }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/projects/workspace/${workspaceId}`, { params });
    return res.data.data.projects;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchProject = createAsyncThunk('project/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/projects/${id}`);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createProject = createAsyncThunk('project/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/projects', data);
    return res.data.data.project;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateProject = createAsyncThunk('project/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/projects/${id}`, data);
    return res.data.data.project;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const archiveProject = createAsyncThunk('project/archive', async (id, { rejectWithValue }) => {
  try {
    await api.put(`/projects/${id}/archive`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    projects: [],
    currentProject: null,
    userRole: null,
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProject: (state) => { state.currentProject = null; state.stats = null; },
    updateProjectInList: (state, action) => {
      const idx = state.projects.findIndex(p => p._id === action.payload._id);
      if (idx !== -1) state.projects[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.loading = true; })
      .addCase(fetchProjects.fulfilled, (state, action) => { state.loading = false; state.projects = action.payload; })
      .addCase(fetchProjects.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchProject.pending, (state) => { state.loading = true; })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload.project;
        state.userRole = action.payload.userRole;
        state.stats = action.payload.stats;
      })
      .addCase(fetchProject.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createProject.fulfilled, (state, action) => { state.projects.unshift(action.payload); })

      .addCase(updateProject.fulfilled, (state, action) => {
        state.currentProject = action.payload;
        const idx = state.projects.findIndex(p => p._id === action.payload._id);
        if (idx !== -1) state.projects[idx] = action.payload;
      })

      .addCase(archiveProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p._id !== action.payload);
      });
  },
});

export const { clearCurrentProject, updateProjectInList } = projectSlice.actions;
export default projectSlice.reducer;
