import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppLibrary from './AppLibrary.tsx';

import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppLibrary />
    </StrictMode>
);
