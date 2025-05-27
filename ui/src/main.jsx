import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AdrDataProvider } from './context/AdrDataContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdrDataProvider>
      <App />
    </AdrDataProvider>
  </React.StrictMode>,
);
