import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { ParametersProvider } from './context/ParametersContext.jsx'
import { QuotationProvider } from './context/QuotationContext.jsx'
import { JobProvider } from './context/JobContext.jsx'

import './index.css'
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ParametersProvider>
        <SocketProvider>
          <BrowserRouter>
            <QuotationProvider>
              <JobProvider>
                <App />
              </JobProvider>
            </QuotationProvider>
          </BrowserRouter>
        </SocketProvider>
      </ParametersProvider>
    </AuthProvider>
  </StrictMode>,
)
