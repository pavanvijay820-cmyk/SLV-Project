import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

// Configure API baseURL with dynamic Railway detection fallback
let apiUrl = import.meta.env.VITE_API_URL || '';

if (!apiUrl && typeof window !== 'undefined') {
  const host = window.location.hostname;
  if (host.includes('railway.app')) {
    const parts = host.split('.');
    const subdomains = parts[0].split('-');
    const backendSubdomains = subdomains.map(part => part === 'frontend' ? 'backend' : part);
    const backendHost = backendSubdomains.join('-') + '.' + parts.slice(1).join('.');
    apiUrl = `https://${backendHost}`;
  }
}

axios.defaults.baseURL = apiUrl;
console.log('Production/Local API URL configured:', apiUrl || 'relative window location');

// Request Interceptor
axios.interceptors.request.use(
  (config) => {
    console.log(`[API REQUEST] => ${config.method.toUpperCase()} ${config.baseURL || ''}${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axios.interceptors.response.use(
  (response) => {
    console.log(`[API RESPONSE] <= SUCCESS ${response.config.method.toUpperCase()} ${response.config.url}:`, response.status, response.data);
    return response;
  },
  (error) => {
    console.error(`[API RESPONSE] <= ERROR ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
