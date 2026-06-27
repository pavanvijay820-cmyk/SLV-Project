import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

// Configure API baseURL with dynamic Railway detection fallback
let apiUrl = import.meta.env.VITE_API_URL || '';

if (typeof window !== 'undefined') {
  const host = window.location.hostname;
  console.log('App Startup: window.location.hostname =', host);
  console.log('App Startup: import.meta.env.VITE_API_URL =', import.meta.env.VITE_API_URL);

  if (!apiUrl && host.includes('railway.app')) {
    const parts = host.split('.');
    const subdomains = parts[0].split('-');
    const backendSubdomains = subdomains.map(part => part === 'frontend' ? 'backend' : part);
    const backendHost = backendSubdomains.join('-') + '.' + parts.slice(1).join('.');
    apiUrl = `https://${backendHost}`;
    console.log('App Startup: Dynamically resolved Railway API URL =', apiUrl);
  }
}

axios.defaults.baseURL = apiUrl;
console.log('App Startup: axios.defaults.baseURL =', axios.defaults.baseURL);

// Request Interceptor
axios.interceptors.request.use(
  (config) => {
    // Manually force relative URLs to be absolute using the configured baseURL
    if (config.baseURL && !config.url.startsWith('http://') && !config.url.startsWith('https://')) {
      const base = config.baseURL.endsWith('/') ? config.baseURL.slice(0, -1) : config.baseURL;
      const path = config.url.startsWith('/') ? config.url : `/${config.url}`;
      config.url = `${base}${path}`;
      config.baseURL = ''; // Clear baseURL so axios doesn't apply it again
    }
    console.log(`[API REQUEST] => ${config.method.toUpperCase()} ${config.url}`, config.data || '');
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
