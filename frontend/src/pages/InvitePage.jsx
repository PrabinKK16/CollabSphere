import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Zap, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const InvitePage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector(s => s.auth)
  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/invites/${token}`)
      .then(r => setInvite(r.data.data.invite))
      .catch(err => setError(err.response?.data?.message || 'Invalid or expired invite link'))
      .finally(() => setLoading(false))
  }, [token])

  const handleAccept = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingInvite', token)
      navigate(`/login?redirect=/invite/${token}`)
      return
    }
    setAccepting(true)
    try {
      const r = await api.post(`/invites/${token}/accept`)
      toast.success(`You've joined ${invite?.workspace?.name}!`)
      navigate(`/workspaces/${r.data.data.workspaceId}/dashboard`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept invite')
    } finally {
      setAccepting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center page-bg px-6">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-xl">CollabSphere</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl text-center">
          {loading ? (
            <div className="py-10">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-500">Verifying invite…</p>
            </div>
          ) : error ? (
            <div className="py-6">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Invalid Invite</h2>
              <p className="text-slate-500 mb-6">{error}</p>
              <Link to="/" className="btn-primary">Go to Homepage</Link>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">You're invited!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                <strong className="text-slate-700 dark:text-slate-300">{invite?.invitedBy?.fullName}</strong> has invited you to join{' '}
                <strong className="text-emerald-600">{invite?.workspace?.name}</strong> as a{' '}
                <span className="capitalize font-semibold">{invite?.role}</span>.
              </p>

              {invite?.workspace?.description && (
                <p className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-6 italic">
                  "{invite.workspace.description}"
                </p>
              )}

              <button onClick={handleAccept} disabled={accepting} className="btn-primary w-full py-3 text-base mb-3">
                {accepting ? (
                  <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Joining…</>
                ) : (
                  <><CheckCircle className="w-4 h-4 inline mr-2" />Accept Invite</>
                )}
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-slate-400">You'll be asked to sign in or create an account.</p>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default InvitePage
