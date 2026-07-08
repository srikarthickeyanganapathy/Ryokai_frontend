import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  console.warn("⚠️ VITE_API_URL is not set! The app will fall back to localhost:8080 in production.");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);