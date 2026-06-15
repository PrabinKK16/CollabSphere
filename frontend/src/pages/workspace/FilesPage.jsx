import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Image, File, Grid, List, Trash2, Download, Loader2, CloudUpload } from 'lucide-react'
import Header from '../../components/layout/Header'
import Avatar from '../../components/ui/Avatar'
import { formatRelative, formatFileSize } from '../../utils/helpers'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const getFileIcon = (mimeType) => {
  if (mimeType?.startsWith('image/')) return { icon: Image, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/30' }
  if (mimeType?.includes('pdf')) return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' }
  return { icon: File, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' }
}

const FilesPage = () => {
  const { workspaceId } = useParams()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState('grid')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const load = () => {
    setLoading(true)
    api.get('/files', { params: { workspaceId } })
      .then(r => setFiles(r.data.data.files || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [workspaceId])

  const uploadFiles = async (fileList) => {
    const arr = Array.from(fileList)
    if (!arr.length) return
    setUploading(true)
    try {
      for (const file of arr) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('workspaceId', workspaceId)
        await api.post('/files/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      toast.success(`${arr.length} file${arr.length > 1 ? 's' : ''} uploaded`)
      load()
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    uploadFiles(e.dataTransfer.files)
  }

  const handleDelete = async (fileId) => {
    if (!confirm('Delete this file?')) return
    try {
      await api.delete(`/files/${fileId}`)
      setFiles(prev => prev.filter(f => f._id !== fileId))
      toast.success('File deleted')
    } catch { toast.error('Delete failed') }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Files"
        subtitle={`${files.length} file${files.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-primary text-sm flex items-center gap-2 py-2">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload
            </button>
            <input ref={inputRef} type="file" multiple className="hidden" onChange={e => uploadFiles(e.target.files)} />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`mb-6 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragging
              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10'
          }`}
        >
          <CloudUpload className={`w-10 h-10 mx-auto mb-2 ${dragging ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {dragging ? 'Drop files here' : 'Drop files or click to upload'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Images, PDFs, documents up to 10MB each</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-emerald-500 animate-spin" /></div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <File className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No files yet. Upload one above.</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {files.map((file, i) => {
                const { icon: Icon, color, bg } = getFileIcon(file.mimeType)
                return (
                  <motion.div key={file._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.04 }}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden">
                    {file.mimeType?.startsWith('image/') ? (
                      <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                        <img src={file.url} alt={file.originalName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-full aspect-square rounded-xl ${bg} flex items-center justify-center mb-3`}>
                        <Icon className={`w-10 h-10 ${color}`} />
                      </div>
                    )}
                    <p className="text-xs font-semibold text-slate-800 dark:text-white truncate mb-1">{file.originalName}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={file.url} download target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 hover:bg-emerald-100 transition-colors">
                        <Download className="w-3 h-3 inline" />
                      </a>
                      <button onClick={() => handleDelete(file._id)} className="flex-1 text-center text-xs py-1 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 transition-colors">
                        <Trash2 className="w-3 h-3 inline" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-2 max-w-4xl">
            {files.map((file, i) => {
              const { icon: Icon, color, bg } = getFileIcon(file.mimeType)
              return (
                <motion.div key={file._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="group flex items-center gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all">
                  {file.mimeType?.startsWith('image/') ? (
                    <img src={file.url} alt={file.originalName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{file.originalName}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{formatRelative(file.createdAt)}</span>
                      {file.uploadedBy && <span className="flex items-center gap-1"><Avatar user={file.uploadedBy} size="xs" />{file.uploadedBy.fullName}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={file.url} download target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
                      <Download className="w-4 h-4" />
                    </a>
                    <button onClick={() => handleDelete(file._id)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default FilesPage
