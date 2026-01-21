/**
 * React Entry Point
 * =================
 * This is where React mounts to the DOM and sets up providers.
 * 
 * 📚 LEARNING POINT:
 * React 18 introduced createRoot() for better concurrent rendering.
 * We wrap our app in BrowserRouter for routing and Toaster for notifications.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
                {/* Toast notifications */}
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1f1f1f',
                            color: '#fff',
                            borderRadius: '10px',
                            padding: '12px 16px',
                        },
                        success: {
                            iconTheme: {
                                primary: '#22c55e',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
)
