import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent unhandled cross-origin or third-party script errors from crashing the app
if (typeof window !== 'undefined') {
  window.onerror = function(message, source, lineno, colno, error) {
    if (
      typeof message === 'string' &&
      (message.indexOf('Script error') !== -1 || !source)
    ) {
      return true;
    }
    return false;
  };

  window.addEventListener('error', (event) => {
    if (
      typeof event.message === 'string' &&
      (event.message.indexOf('Script error') !== -1 || !event.filename)
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    // Prevent unhandled promise rejection from aborting UI
    if (
      event.reason &&
      (event.reason.name === 'NotAllowedError' ||
        event.reason.name === 'AbortError' ||
        event.reason.name === 'SecurityError' ||
        (typeof event.reason.message === 'string' && event.reason.message.includes('play()')))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FFF8F3] text-[#4D4449] text-center font-montserrat">
          <div className="w-16 h-16 rounded-full bg-[#FBE3EC] text-[#B995A7] flex items-center justify-center text-3xl mb-4 border border-[#E9BBCD]">
            ❦
          </div>
          <h2 className="font-cormorant text-3xl font-bold mb-2 text-[#4D4449]">L'amour est Hera</h2>
          <p className="text-sm text-[#76636E] max-w-md mb-6">
            Đã có một sự gián đoạn nhỏ khi tải trang. Xin vui lòng nhấn nút bên dưới để thử lại.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#C4A1B2] to-[#9D7E90] text-[#FFFCFA] font-semibold text-xs border border-[#E2CFA9] shadow-md hover:scale-105 transition-transform cursor-pointer"
          >
            ✦ Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

