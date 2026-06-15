import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './store'
import { SocketProvider } from './hooks/useSocket'
import App from './App.jsx'
import './index.css'

// Apply persisted theme before render to avoid flash
const savedTheme = localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
document.documentElement.classList.toggle('dark', savedTheme === 'dark')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: savedTheme === 'dark' ? '#1e293b' : '#fff',
              color: savedTheme === 'dark' ? '#f1f5f9' : '#0f172a',
              border: '1px solid',
              borderColor: savedTheme === 'dark' ? '#334155' : '#e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </SocketProvider>
    </Provider>
  </StrictMode>,
)
