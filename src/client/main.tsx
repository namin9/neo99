import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Result from './pages/Result';
import Admin from './pages/Admin';
import './styles.css';

function AppShell() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header>
          <div>
            <h1>NeoQik Reverse ETA</h1>
            <p>Plan the fastest reverse routes across Korea&apos;s express bus network.</p>
          </div>
          <nav>
            <NavLink to="/" end>
              홈
            </NavLink>
            <NavLink to="/admin">어드민</NavLink>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/result" element={<Result />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <footer>
          © {new Date().getFullYear()} NeoQik • Built for Cloudflare Pages
        </footer>
      </div>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>,
);
