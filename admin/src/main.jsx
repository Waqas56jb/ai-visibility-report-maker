import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LucideProvider } from 'lucide-react';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LucideProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LucideProvider>
  </React.StrictMode>
);
