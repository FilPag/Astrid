import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { InputScreen, MainScreen } from './render/screens';

declare global {
  interface Window {
    electronAPI?: any;
    env?: any;
  }
}

const root = createRoot(document.getElementById('root'));
root.render(
  <HashRouter>
    <Routes>
      <Route path="/input" Component={InputScreen} />
      <Route path="/" Component={MainScreen} />
    </Routes>
  </HashRouter>
);
