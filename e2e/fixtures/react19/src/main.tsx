import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@opencorestack/opengridx/styles';
import './styles.css';
import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('#root missing');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
