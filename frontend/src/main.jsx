import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL APP ERROR:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F9FC] text-[#101828] flex items-center justify-center p-6 font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-2xl p-8 max-w-md w-full shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-[#101828]">Something went wrong</h2>
            <p className="text-xs text-[#667085] leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Reload Dashboard
              </button>
              <button
                onClick={() => {
                  try { localStorage.clear(); sessionStorage.clear(); } catch {}
                  window.location.href = '/';
                }}
                className="w-full py-2 px-4 bg-[#F9FAFB] hover:bg-[#F2F4F7] text-[#475467] font-medium text-xs rounded-xl border border-[#EAECF0] transition-colors cursor-pointer"
              >
                Clear Cache & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
