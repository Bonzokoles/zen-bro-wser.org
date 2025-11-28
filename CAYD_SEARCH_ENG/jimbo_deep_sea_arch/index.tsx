import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Assuming a global CSS file for Tailwind directives.
// If your project setup is different, you might need to adjust this.
import './styles/global.css'; 

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
