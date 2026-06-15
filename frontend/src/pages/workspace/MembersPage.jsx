import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { UserPlus, Search, Crown, Shield, Users, UserCheck, Eye, MoreVertical, Loader2, Check } from 'lucide-react'
import { fetchWorkspace } from '../../store/slices/workspaceSlice'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import Avatar from '../../components/ui/Avatar'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const ROLE_ICONS = { owner: Crown, admin: Shield, manager: Users, member: UserCheck, guest: Eye }
const ROLE_COLORS = {
  owner: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
  admin: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400',
  manager: 'bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400',
  member: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
  guest: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
}

const MembersPage = () => {
  const { workspaceId } = useParams()
  const dispatch = useDispatch()
  const { members, loading, userRole } = useSelector(s => s.workspace)
  const { onlineUsers } = useSelector(s => s.ui)
  const [search, setSearch] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviting, setInviting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)

  useEffect(() => { dispatch(fetchWorkspace(workspaceId)) }, [workspaceId, dispatch])

  const filtered = members.filter(m =>
    m.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    m.user?.email?.toLowerCase().includes(search.toLowerCase())
  )

  const isOnline = (userId) => onlineUsers.includes(userId?.toString())

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    try {
      await api.post('/invites', { workspaceId, emails: [inviteEmail], role: inviteRole })
      toast.success(`Invite sent to ${inviteEmail}`)
      setShowInvite(false)
      setInviteEmail('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await api.put(`/workspaces/${workspaceId}/members/${memberId}/role`, { role: newRole })
      dispatch(fetchWorkspace(workspaceId))
      toast.success('Role updated')
    } catch { toast.error('Failed to update role') }
    setMenuOpen(null)
  }

  const handleRemove = async (memberId) => {
    if (!confirm('Remove this member from the workspace?')) return
    try {
      await api.delete(`/workspaces/${workspaceId}/members/${memberId}`)
      dispatch(fetchWorkspace(workspaceId))
      toast.success('Member removed')
    } catch { toast.error('Failed to remove member') }
    setMenuOpen(null)
  }

  const canManage = ['owner', 'admin'].includes(userRole)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Members"
        subtitle={`${members.length} member${members.length !== 1 ? 's' : ''}`}
        actions={
          canManage && (
            <button onClick={() => setShowInvite(true)} className="btn-primary text-sm flex items-center gap-2 py-2">
              <UserPlus className="w-4 h-4" /> Invite Member
            </button>
          )
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members…" className="input-field pl-9" />
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-emerald-500 animate-spin" /></div>
          ) : (
            <div className="space-y-3">
              {filtered.map((member, i) => {
                const RoleIcon = ROLE_ICONS[member.role] || UserCheck
                return (
                  <motion.div key={member._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="group flex items-center gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                    <Avatar user={member.user} size="lg" showOnline isOnline={isOnline(member.user?._id)} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white">{member.user?.fullName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{member.user?.designation || member.user?.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{member.user?.email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`badge flex items-center gap-1 ${ROLE_COLORS[member.role]}`}>
                        <RoleIcon className="w-3 h-3" />
                        <span className="capitalize">{member.role}</span>
                      </span>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline(member.user?._id) ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    </div>

                    {canManage && member.role !== 'owner' && (
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === member._id ? null : member._id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {menuOpen === member._id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 top-10 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-20 min-w-40">
                              <p className="text-xs font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">Change Role</p>
                              {['admin','manager','member','guest'].map(r => (
                                <button key={r} onClick={() => handleRoleChange(member._id, r)}
                                  className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 capitalize ${member.role === r ? 'text-emerald-600 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
                                  {member.role === r && <Check className="w-3 h-3" />}
                                  <span className={member.role === r ? '' : 'pl-4'}>{r}</span>
                                </button>
                              ))}
                              <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                                <button onClick={() => handleRemove(member._id)}
                                  className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                                  Remove from workspace
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Invite Member" size="sm">
        <form onSubmit={handleInvite} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
            <input
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="input-field"
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="input-field">
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
              <option value="guest">Guest (read-only)</option>
            </select>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <button type="button" onClick={() => setShowInvite(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={inviting} className="btn-primary flex-1">
              {inviting ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default MembersPage
