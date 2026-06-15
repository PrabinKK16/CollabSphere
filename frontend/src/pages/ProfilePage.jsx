import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera, Save, Lock, Bell, Loader2, Eye, EyeOff } from 'lucide-react'
import { updateUser } from '../store/slices/authSlice'
import api from '../api/axios'
import Avatar from '../components/ui/Avatar'
import { generateAvatarColor } from '../utils/helpers'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { userId } = useParams()
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const isOwn = !userId || userId === user?._id
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(!!userId)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('profile')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ fullName: '', username: '', designation: '', bio: '', timezone: '' })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [notifPrefs, setNotifPrefs] = useState({ email: true, inApp: true })
  const avatarRef = useRef(null)

  useEffect(() => {
    if (userId && userId !== user?._id) {
      api.get(`/users/${userId}`).then(r => setProfile(r.data.data.user)).finally(() => setLoading(false))
    } else {
      setProfile(user)
      if (user) {
        setForm({ fullName: user.fullName || '', username: user.username || '', designation: user.designation || '', bio: user.bio || '', timezone: user.timezone || '' })
        setNotifPrefs(user.notificationPreferences || { email: true, inApp: true })
      }
    }
  }, [userId, user])

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('avatar', file)
    try {
      const r = await api.post('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      dispatch(updateUser({ avatar: r.data.data.avatar }))
      toast.success('Avatar updated!')
    } catch { toast.error('Failed to upload avatar') }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await api.put('/users/profile', form)
      dispatch(updateUser(r.data.data.user))
      toast.success('Profile saved!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match')
    setSaving(true)
    try {
      await api.put('/users/password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
      toast.success('Password changed!')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password') }
    finally { setSaving(false) }
  }

  const handleSaveNotifs = async () => {
    try {
      await api.put('/users/notification-preferences', notifPrefs)
      dispatch(updateUser({ notificationPreferences: notifPrefs }))
      toast.success('Notification preferences saved!')
    } catch { toast.error('Failed to save preferences') }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center page-bg">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  )

  const displayUser = isOwn ? user : profile

  return (
    <div className="min-h-screen page-bg">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/workspaces" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-slate-900 dark:text-white text-lg">
            {isOwn ? 'Your Profile' : displayUser?.fullName}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6 flex items-center gap-6">
          <div className="relative flex-shrink-0">
            {displayUser?.avatar ? (
              <img src={displayUser.avatar} alt={displayUser.fullName} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black ring-4 ring-white dark:ring-slate-800 shadow-lg"
                style={{ background: generateAvatarColor(displayUser?.fullName) }}>
                {displayUser?.fullName?.[0]?.toUpperCase()}
              </div>
            )}
            {isOwn && (
              <button onClick={() => avatarRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 gradient-bg rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Camera className="w-4 h-4 text-white" />
              </button>
            )}
            {isOwn && <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{displayUser?.fullName}</h2>
            <p className="text-slate-500 dark:text-slate-400">@{displayUser?.username}</p>
            {displayUser?.designation && <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{displayUser.designation}</p>}
            {displayUser?.bio && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{displayUser.bio}</p>}
          </div>
        </div>

        {isOwn && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
              {[
                { id: 'profile', label: 'Profile' },
                { id: 'password', label: 'Password' },
                { id: 'notifications', label: 'Notifications' },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Profile tab */}
            {tab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-5">Edit Profile</h3>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                      <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="input-field" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                      <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="input-field" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Designation / Title</label>
                    <input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} className="input-field" placeholder="e.g. Senior Engineer" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                    <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="input-field resize-none" rows={3} placeholder="Tell your team about yourself…" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Timezone</label>
                    <input value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })} className="input-field" placeholder="e.g. America/New_York" />
                  </div>
                  <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving…' : 'Save Profile'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Password tab */}
            {tab === 'password' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md">
                <h3 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-500" /> Change Password
                </h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {[
                    { key: 'currentPassword', label: 'Current Password', show: showOld, toggle: () => setShowOld(!showOld) },
                    { key: 'newPassword', label: 'New Password', show: showNew, toggle: () => setShowNew(!showNew) },
                    { key: 'confirmPassword', label: 'Confirm New Password', show: showNew },
                  ].map(({ key, label, show, toggle }) => (
                    <div key={key} className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={show ? 'text' : 'password'}
                          value={passForm[key]}
                          onChange={e => setPassForm({ ...passForm, [key]: e.target.value })}
                          className="input-field pl-9 pr-10"
                          required
                        />
                        {toggle && (
                          <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    {saving ? 'Updating…' : 'Update Password'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Notifications tab */}
            {tab === 'notifications' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md">
                <h3 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-500" /> Notification Preferences
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'inApp', label: 'In-App Notifications', desc: 'Show notifications in the app' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${notifPrefs[key] ? 'gradient-bg' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifPrefs[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                  <button onClick={handleSaveNotifs} className="btn-primary flex items-center gap-2 text-sm">
                    <Save className="w-4 h-4" /> Save Preferences
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
