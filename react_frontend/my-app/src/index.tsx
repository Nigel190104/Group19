import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from './context/ThemeContext'; // Import ThemeProvider
import { AccessibilityProvider } from './context/AccessibilityContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AccessibilityProvider>
        <App />
      </AccessibilityProvider>
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
