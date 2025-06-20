import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DailyProvider } from "@daily-co/daily-react";

import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DailyProvider>
      <App />
    </DailyProvider>
  </StrictMode>
);
