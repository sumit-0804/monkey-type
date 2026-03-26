import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import '@/store/useThemeStore'
import App from './App.tsx'
import { Toaster } from "@/components/ui/sonner"

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
      <Toaster />
    </GoogleOAuthProvider>
  </StrictMode>,
)
