import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, CheckSquare, Calendar, Paperclip, MessageSquare,
  Plus, Trash2, Check, Send, Loader2, Edit3, Save, X
} from 'lucide-react'
import { fetchTask, updateTask } from '../../store/slices/taskSlice'
import Header from '../../components/layout/Header'
import Avatar from '../../components/ui/Avatar'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge'
import { formatDate, formatRelative } from '../../utils/helpers'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const TaskDetailPage = () => {
  const { workspaceId, projectId, taskId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentTask, loading } = useSelector(s => s.task)
  const { user } = useSelector(s => s.auth)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [editingDesc, setEditingDesc] = useState(false)
  const [descDraft, setDescDraft] = useState('')
  const [checklistDraft, setChecklistDraft] = useState('')
  const [addingChecklist, setAddingChecklist] = useState(false)
  const commentRef = useRef(null)

  useEffect(() => {
    dispatch(fetchTask(taskId))
    api.get('/comments', { params: { taskId } })
      .then(r => setComments(r.data.data.comments || []))
      .catch(() => {})
  }, [taskId, dispatch])

  useEffect(() => {
    if (currentTask) {
      setTitleDraft(currentTask.title)
      setDescDraft(currentTask.description || '')
    }
  }, [currentTask])

  const saveTitle = async () => {
    if (!titleDraft.trim() || titleDraft === currentTask.title) { setEditingTitle(false); return }
    await dispatch(updateTask({ id: taskId, data: { title: titleDraft } }))
    setEditingTitle(false)
  }

  const saveDesc = async () => {
    await dispatch(updateTask({ id: taskId, data: { description: descDraft } }))
    setEditingDesc(false)
  }

  const toggleStatus = (status) => dispatch(updateTask({ id: taskId, data: { status } }))
  const togglePriority = (priority) => dispatch(updateTask({ id: taskId, data: { priority } }))

  const toggleChecklist = async (itemId, isCompleted) => {
    const updated = currentTask.checklist.map(c =>
      c._id === itemId ? { ...c, isCompleted: !isCompleted } : c
    )
    await dispatch(updateTask({ id: taskId, data: { checklist: updated } }))
  }

  const addChecklistItem = async (e) => {
    e.preventDefault()
    if (!checklistDraft.trim()) return
    const updated = [...(currentTask.checklist || []), { title: checklistDraft, isCompleted: false }]
    await dispatch(updateTask({ id: taskId, data: { checklist: updated } }))
    setChecklistDraft('')
    setAddingChecklist(false)
  }

  const sendComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSendingComment(true)
    try {
      const r = await api.post('/comments', { taskId, content: commentText })
      setComments(prev => [r.data.data.comment, ...prev])
      setCommentText('')
    } catch { toast.error('Failed to send comment') }
    finally { setSendingComment(false) }
  }

  if (loading && !currentTask) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  const task = currentTask

  const checklistDone = task?.checklist?.filter(c => c.isCompleted).length || 0
  const checklistTotal = task?.checklist?.length || 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title={
          <button
            onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}`)}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to project
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              {editingTitle ? (
                <div className="flex gap-2">
                  <input
                    value={titleDraft}
                    onChange={e => setTitleDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
                    className="input-field flex-1 text-xl font-bold"
                    autoFocus
                  />
                  <button onClick={saveTitle} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Save className="w-4 h-4" /></button>
                  <button onClick={() => setEditingTitle(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-start gap-3 group">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white flex-1 leading-snug">{task?.title}</h1>
                  <button onClick={() => setEditingTitle(true)} className="p-1.5 text-slate-300 hover:text-slate-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-2 flex-wrap mt-3">
                <StatusBadge status={task?.status} />
                <PriorityBadge priority={task?.priority} />
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 dark:text-white">Description</h3>
                {!editingDesc && (
                  <button onClick={() => setEditingDesc(true)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {editingDesc ? (
                <div className="space-y-3">
                  <textarea
                    value={descDraft}
                    onChange={e => setDescDraft(e.target.value)}
                    className="input-field resize-none"
                    rows={5}
                    placeholder="Add a description…"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={saveDesc} className="btn-primary text-sm py-1.5 px-4">Save</button>
                    <button onClick={() => setEditingDesc(false)} className="btn-secondary text-sm py-1.5 px-4">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {task?.description || <span className="italic text-slate-400">No description yet. Click the pencil to add one.</span>}
                </p>
              )}
            </div>

            {/* Checklist */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  Checklist
                  {checklistTotal > 0 && (
                    <span className="text-xs font-normal text-slate-500">
                      {checklistDone}/{checklistTotal}
                    </span>
                  )}
                </h3>
                <button onClick={() => setAddingChecklist(true)} className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add item
                </button>
              </div>

              {checklistTotal > 0 && (
                <div className="mb-4">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-3">
                    <div className="gradient-bg h-1.5 rounded-full transition-all" style={{ width: `${checklistTotal ? (checklistDone / checklistTotal) * 100 : 0}%` }} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {task?.checklist?.map(item => (
                  <motion.div key={item._id} layout className="flex items-center gap-3 group">
                    <button
                      onClick={() => toggleChecklist(item._id, item.isCompleted)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        item.isCompleted
                          ? 'gradient-bg border-transparent'
                          : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400'
                      }`}
                    >
                      {item.isCompleted && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`text-sm flex-1 ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {item.title}
                    </span>
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {addingChecklist && (
                  <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    onSubmit={addChecklistItem} className="mt-3 flex gap-2">
                    <input
                      value={checklistDraft}
                      onChange={e => setChecklistDraft(e.target.value)}
                      className="input-field flex-1 text-sm py-2"
                      placeholder="Add checklist item…"
                      autoFocus
                    />
                    <button type="submit" className="btn-primary text-sm py-2 px-3">Add</button>
                    <button type="button" onClick={() => setAddingChecklist(false)} className="btn-secondary text-sm py-2 px-3">Cancel</button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Comments */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                Comments ({comments.length})
              </h3>

              <form onSubmit={sendComment} className="flex gap-3 mb-6">
                <Avatar user={user} size="sm" className="flex-shrink-0 mt-0.5" />
                <div className="flex-1 flex gap-2">
                  <input
                    ref={commentRef}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Add a comment…"
                    className="input-field flex-1"
                  />
                  <button type="submit" disabled={sendingComment || !commentText.trim()} className="btn-primary py-2.5 px-4 flex-shrink-0">
                    {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-6">No comments yet. Start the conversation!</p>
                ) : comments.map(comment => (
                  <motion.div key={comment._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3">
                    <Avatar user={comment.author} size="sm" className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-slate-800 dark:text-white">{comment.author?.fullName}</span>
                        <span className="text-xs text-slate-400">{formatRelative(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Status</p>
              <div className="grid grid-cols-2 gap-1.5">
                {['backlog','todo','in_progress','review','testing','done'].map(s => (
                  <button key={s} onClick={() => toggleStatus(s)}
                    className={`text-xs px-2 py-1.5 rounded-lg capitalize font-medium transition-all ${
                      task?.status === s ? 'gradient-bg text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Priority</p>
              <div className="grid grid-cols-2 gap-1.5">
                {['low','medium','high','critical'].map(p => (
                  <button key={p} onClick={() => togglePriority(p)}
                    className={`text-xs px-2 py-1.5 rounded-lg capitalize font-medium transition-all ${
                      task?.priority === p ? 'gradient-bg text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignees */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Assignees</p>
              {task?.assignees?.length === 0 ? (
                <p className="text-xs text-slate-400">Unassigned</p>
              ) : (
                <div className="space-y-2">
                  {task?.assignees?.map(a => (
                    <div key={a._id} className="flex items-center gap-2">
                      <Avatar user={a} size="xs" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{a.fullName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dates */}
            {(task?.startDate || task?.dueDate) && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Dates</p>
                {task?.startDate && (
                  <div className="flex items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Start: {formatDate(task.startDate)}</span>
                  </div>
                )}
                {task?.dueDate && (
                  <div className={`flex items-center gap-2 text-sm ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
                    <Calendar className="w-4 h-4" />
                    <span>Due: {formatDate(task.dueDate)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Meta */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-xs text-slate-400 space-y-1">
              <p>Created {formatRelative(task?.createdAt)}</p>
              {task?.createdBy && <p>by {task.createdBy?.fullName}</p>}
              {task?.updatedAt !== task?.createdAt && <p>Updated {formatRelative(task?.updatedAt)}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailPage
