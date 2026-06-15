import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Settings, Upload, AlertTriangle, Save, Loader2, Trash2 } from 'lucide-react'
import { fetchWorkspace, updateWorkspace } from '../../store/slices/workspaceSlice'
import Header from '../../components/layout/Header'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const SettingsPage = () => {
  const { workspaceId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentWorkspace, userRole, loading } = useSelector(s => s.workspace)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  useEffect(() => {
    dispatch(fetchWorkspace(workspaceId))
  }, [workspaceId, dispatch])

  useEffect(() => {
    if (currentWorkspace) {
      setForm({ name: currentWorkspace.name || '', description: currentWorkspace.description || '' })
      setLogoPreview(currentWorkspace.logo || null)
    }
  }, [currentWorkspace])

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let updateData = { ...form }

      if (logoFile) {
        const fd = new FormData()
        fd.append('logo', logoFile)
        const r = await api.put(`/workspaces/${workspaceId}/logo`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        updateData.logo = r.data.data.logoUrl
      }

      await dispatch(updateWorkspace({ id: workspaceId, data: updateData })).unwrap()
      toast.success('Settings saved!')
    } catch (err) {
      toast.error(err || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== currentWorkspace?.name) return toast.error('Name does not match')
    setDeleting(true)
    try {
      await api.delete(`/workspaces/${workspaceId}`)
      toast.success('Workspace deleted')
      navigate('/workspaces')
    } catch { toast.error('Failed to delete workspace') }
    finally { setDeleting(false) }
  }

  if (userRole !== 'owner' && userRole !== 'admin') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Only workspace owners and admins can access settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Settings" subtitle="Workspace configuration" />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* General */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">General</h2>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Logo */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl font-bold ring-2 ring-slate-200 dark:ring-slate-700">
                      {form.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="btn-secondary text-sm cursor-pointer flex items-center gap-2 w-fit">
                    <Upload className="w-4 h-4" /> Change Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </label>
                  <p className="text-xs text-slate-400 mt-1.5">PNG, JPG up to 2MB</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Workspace Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="Acme Engineering"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="What is this workspace for?"
                />
              </div>

              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </motion.div>

          {/* Plan info */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Plan</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-white capitalize">{currentWorkspace?.plan || 'Starter'} Plan</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {currentWorkspace?.plan === 'pro' ? 'Unlimited members, projects, and storage.' : '5 members, 3 projects, 1GB storage.'}
                </p>
              </div>
              {currentWorkspace?.plan !== 'enterprise' && (
                <button className="btn-primary text-sm py-2">Upgrade</button>
              )}
            </div>
          </motion.div>

          {/* Danger zone */}
          {userRole === 'owner' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-6">
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Permanently delete <strong>{currentWorkspace?.name}</strong> and all of its data including projects, tasks, files, and members. This action cannot be undone.
                </p>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Type <strong>{currentWorkspace?.name}</strong> to confirm
                  </label>
                  <input
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    className="input-field border-red-200 dark:border-red-900 focus:ring-red-400"
                    placeholder={currentWorkspace?.name}
                  />
                </div>
                <button
                  onClick={handleDelete}
                  disabled={deleting || deleteConfirm !== currentWorkspace?.name}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Workspace
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
