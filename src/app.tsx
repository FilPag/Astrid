import { createRoot } from 'react-dom/client';
import { MainScreen } from './render/screens';

declare global {
  interface Window {
    electronAPI?: any;
    env?: any;
  }
}

const root = createRoot(document.getElementById('root'));
root.render(<MainScreen />);
