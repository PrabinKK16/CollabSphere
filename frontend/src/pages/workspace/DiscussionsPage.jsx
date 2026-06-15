import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Plus, Search, ThumbsUp, MessageCircle, Eye, Send, X, Loader2 } from 'lucide-react'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import Avatar from '../../components/ui/Avatar'
import { formatRelative } from '../../utils/helpers'
import api from '../../api/axios'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

const DiscussionsPage = () => {
  const { workspaceId } = useParams()
  const { user } = useSelector(s => s.auth)
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [creating, setCreating] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/discussions', { params: { workspaceId } })
      .then(r => setDiscussions(r.data.data.discussions || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [workspaceId])

  const openDiscussion = (d) => {
    setSelected(d)
    api.get('/comments', { params: { discussionId: d._id } })
      .then(r => setComments(r.data.data.comments || []))
    api.patch ? api.patch(`/discussions/${d._id}/view`) : null
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const r = await api.post('/discussions', { ...form, workspaceId })
      setDiscussions(prev => [r.data.data.discussion, ...prev])
      toast.success('Discussion posted!')
      setShowCreate(false)
      setForm({ title: '', content: '' })
    } catch { toast.error('Failed to post') }
    finally { setCreating(false) }
  }

  const sendComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSendingComment(true)
    try {
      const r = await api.post('/comments', { discussionId: selected._id, content: commentText })
      setComments(prev => [...prev, r.data.data.comment])
      setCommentText('')
    } catch { toast.error('Failed to send') }
    finally { setSendingComment(false) }
  }

  const filtered = discussions.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.content?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Discussions"
        subtitle={`${discussions.length} thread${discussions.length !== 1 ? 's' : ''}`}
        actions={
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm flex items-center gap-2 py-2">
            <Plus className="w-4 h-4" /> New Discussion
          </button>
        }
      />

      <div className="flex-1 overflow-hidden flex">
        {/* Thread list */}
        <div className={`${selected ? 'hidden lg:flex' : 'flex'} flex-col flex-1 overflow-hidden`}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search discussions…" className="input-field pl-9" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-emerald-500 animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">No discussions yet</p>
                <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">Start a discussion</button>
              </div>
            ) : filtered.map((d, i) => (
              <motion.div key={d._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => openDiscussion(d)}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all ${
                  selected?._id === d._id ? 'border-emerald-400 dark:border-emerald-600 shadow-md' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar user={d.author} size="sm" className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1 line-clamp-1">{d.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{d.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{formatRelative(d.createdAt)}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{d.commentCount || 0}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{d.viewCount || 0}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Thread detail */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
              className="flex flex-col w-full lg:w-[560px] flex-shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 lg:hidden">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{selected.title}</h3>
                  <p className="text-xs text-slate-500">by {selected.author?.fullName} · {formatRelative(selected.createdAt)}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hidden lg:flex">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                {/* Original post */}
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar user={selected.author} size="xs" />
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{selected.author?.fullName}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selected.content}</p>
                </div>

                {/* Comments */}
                {comments.map(c => (
                  <div key={c._id} className="flex gap-2">
                    <Avatar user={c.author} size="xs" className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-800 dark:text-white">{c.author?.fullName}</span>
                        <span className="text-xs text-slate-400">{formatRelative(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendComment} className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <Avatar user={user} size="xs" className="flex-shrink-0 mt-2" />
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Reply to this discussion…"
                  className="input-field flex-1 text-sm py-2"
                />
                <button type="submit" disabled={sendingComment || !commentText.trim()} className="btn-primary py-2 px-3">
                  {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Discussion" size="md">
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title *</label>
            <input placeholder="What would you like to discuss?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Content *</label>
            <textarea placeholder="Share your thoughts, questions, or updates…" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="input-field resize-none" rows={6} required />
          </div>
          <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={creating || !form.title || !form.content} className="btn-primary flex-1">
              {creating ? 'Posting…' : 'Post Discussion'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default DiscussionsPage
