import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { WizardProvider } from './components/Wizard/WizardProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WizardProvider>
      <App />
    </WizardProvider>
  </React.StrictMode>
);
