import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppLibrary from './AppLibrary.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppLibrary />
    </StrictMode>
);
