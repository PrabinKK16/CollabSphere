import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Calendar, CheckSquare, AlertCircle, Clock, Search, Filter } from 'lucide-react';
import { fetchKanbanTasks, updateTaskStatus, createTask, moveTaskKanban } from '../../store/slices/taskSlice';
import { fetchProject } from '../../store/slices/projectSlice';
import Header from '../../components/layout/Header';
import Modal from '../../components/ui/Modal';
import Avatar, { AvatarGroup } from '../../components/ui/Avatar';
import { PriorityBadge } from '../../components/ui/Badge';
import { SkeletonKanban } from '../../components/ui/Skeleton';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'bg-slate-400', count_color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
  { id: 'todo', label: 'To Do', color: 'bg-blue-400', count_color: 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-amber-400', count_color: 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' },
  { id: 'review', label: 'Review', color: 'bg-purple-400', count_color: 'bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400' },
  { id: 'testing', label: 'Testing', color: 'bg-cyan-400', count_color: 'bg-cyan-100 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400' },
  { id: 'done', label: 'Done', color: 'bg-emerald-400', count_color: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' },
];

const getPriorityIcon = (priority) => {
  const icons = { critical: '🔴', high: '🟠', medium: '🟡', low: '🔵' };
  return icons[priority] || '⚪';
};

const TaskCard = ({ task, index }) => {
  const checklistDone = task.checklist?.filter(c => c.isCompleted).length || 0;
  const checklistTotal = task.checklist?.length || 0;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-3 shadow-sm cursor-grab active:cursor-grabbing select-none
            ${snapshot.isDragging ? 'shadow-xl border-emerald-300 dark:border-emerald-600 rotate-1 scale-[1.02]' : 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'}
            transition-all duration-150`}
        >
          {task.labels?.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-2">
              {task.labels.slice(0, 3).map(label => (
                <span key={label} className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">{label}</span>
              ))}
            </div>
          )}

          <p className="text-sm font-semibold text-slate-800 dark:text-white mb-3 leading-snug line-clamp-2">{task.title}</p>

          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="text-xs">{getPriorityIcon(task.priority)}</span>
            <PriorityBadge priority={task.priority} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {checklistTotal > 0 && (
                <span className={`flex items-center gap-1 text-xs ${checklistDone === checklistTotal ? 'text-emerald-500' : 'text-slate-400'}`}>
                  <CheckSquare className="w-3 h-3" />{checklistDone}/{checklistTotal}
                </span>
              )}
              {task.dueDate && (
                <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                  {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                  {formatDate(task.dueDate).replace('Today at ', '').split(' ')[0]}
                </span>
              )}
            </div>
            {task.assignees?.length > 0 && (
              <AvatarGroup users={task.assignees} max={2} size="xs" />
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

const KanbanPage = () => {
  const { workspaceId, projectId } = useParams();
  const dispatch = useDispatch();
  const { kanbanColumns, kanbanLoading } = useSelector(s => s.task);
  const { currentProject } = useSelector(s => s.project);
  const { user } = useSelector(s => s.auth);
  const [showCreate, setShowCreate] = useState(false);
  const [createStatus, setCreateStatus] = useState('todo');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchKanbanTasks({ projectId, params: { search } }));
    if (!currentProject) dispatch(fetchProject(projectId));
  }, [projectId, dispatch, search]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    dispatch(moveTaskKanban({
      taskId: draggableId,
      fromStatus: source.droppableId,
      toStatus: destination.droppableId,
      newOrder: destination.index
    }));

    try {
      await dispatch(updateTaskStatus({ id: draggableId, status: destination.droppableId, order: destination.index })).unwrap();
    } catch {
      dispatch(fetchKanbanTasks({ projectId }));
      toast.error('Failed to update task');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await dispatch(createTask({ ...form, projectId, status: createStatus })).unwrap();
      toast.success('Task created!');
      setShowCreate(false);
      setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
    } catch (err) { toast.error(err || 'Failed'); }
    finally { setCreating(false); }
  };

  const openCreate = (status) => { setCreateStatus(status); setShowCreate(true); };

  if (kanbanLoading && !kanbanColumns) return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Kanban Board" />
      <div className="flex-1 overflow-y-auto p-6"><SkeletonKanban /></div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title={currentProject ? `${currentProject.icon} ${currentProject.name}` : 'Kanban Board'}
        subtitle="Drag and drop tasks between columns"
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter tasks..." className="input-field pl-8 py-2 text-sm w-48" />
            </div>
            <button onClick={() => openCreate('todo')} className="btn-primary text-sm flex items-center gap-1.5 py-2">
              <Plus className="w-3.5 h-3.5" /> Task
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full min-h-0" style={{ minWidth: `${COLUMNS.length * 296}px` }}>
            {COLUMNS.map(col => {
              const tasks = kanbanColumns?.[col.id] || [];
              return (
                <div key={col.id} className="flex flex-col w-72 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className={`w-3 h-3 rounded-full ${col.color} flex-shrink-0`} />
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">{col.label}</h3>
                    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${col.count_color}`}>{tasks.length}</span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 rounded-2xl p-3 min-h-32 transition-colors ${snapshot.isDraggingOver ? 'bg-emerald-50 dark:bg-emerald-950/20 border-2 border-dashed border-emerald-300 dark:border-emerald-700' : 'bg-slate-50 dark:bg-slate-900/50'}`}
                      >
                        {tasks.map((task, index) => (
                          <TaskCard key={task._id} task={task} index={index} />
                        ))}
                        {provided.placeholder}

                        <button
                          onClick={() => openCreate(col.id)}
                          className="w-full mt-1 p-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:text-emerald-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 transition-all flex items-center justify-center gap-1.5 text-sm"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add task
                        </button>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Task" size="md">
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Task Title *</label>
            <input placeholder="What needs to be done?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea placeholder="Add more details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Starting in column</label>
            <select value={createStatus} onChange={e => setCreateStatus(e.target.value)} className="input-field">
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={creating || !form.title} className="btn-primary flex-1">{creating ? 'Creating...' : 'Create Task'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default KanbanPage;
