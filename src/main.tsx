// Intercept and prevent benign Vite HMR WebSocket connection warnings from displaying overlay errors in sandbox
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const reasonStr = typeof reason === 'string' ? reason : reason?.message || String(reason || '');
    if (
      reasonStr.includes('WebSocket closed without opened') ||
      reasonStr.includes('[vite] failed to connect to websocket') ||
      reasonStr.includes('failed to connect to websocket')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('WebSocket closed without opened') ||
      msg.includes('[vite] failed to connect to websocket')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

