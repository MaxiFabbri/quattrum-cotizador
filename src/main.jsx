import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'


import { AuthProvider } from './context/AuthContext.jsx'
import { ParametersProvider } from './context/ParametersContext.jsx'
import { QuotationProvider } from './context/QuotationContext.jsx'

import './index.css'
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ParametersProvider>
        <BrowserRouter>
          <QuotationProvider>
            <App />
          </QuotationProvider>
        </BrowserRouter>
      </ParametersProvider>
    </AuthProvider>
  </StrictMode>,
)
