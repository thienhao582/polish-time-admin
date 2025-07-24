import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './hooks/useAuth'
import { DemoModeProvider } from './contexts/DemoModeContext'
import { Toaster } from "@/components/ui/toaster"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DemoModeProvider>
        <LanguageProvider>
          <AuthProvider>
            <App />
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </DemoModeProvider>
    </BrowserRouter>
  </StrictMode>,
)
