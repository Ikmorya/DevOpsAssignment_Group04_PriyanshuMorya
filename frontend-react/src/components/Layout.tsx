import { Outlet, Link } from 'react-router-dom';
import BackgroundTicker from './HomeSidePanel';

export default function Layout() {
  return (
    <>
      <div className="mesh-bg">
        <div className="mesh-blob-3" />
      </div>
      <div className="hero-bg-grid" />
      <BackgroundTicker />
      <div className="page-wrapper">
        <nav className="navbar">
          <div className="navbar-inner">
            <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <img
                src="/logo.png"
                alt="DROPP Logo"
                width={280}
                height={120}
                style={{ objectFit: 'contain' }}
              />
            </Link>
            <div className="navbar-links">
              <Link to="/upload" className="nav-link" id="nav-upload">Upload</Link>
              <Link to="/retrieve" className="nav-link" id="nav-retrieve">Retrieve</Link>
            </div>
          </div>
        </nav>
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
        <footer className="footer">
          <p>
            Built with 💜 &nbsp;·&nbsp; Files auto-expire in 24h &nbsp;·&nbsp;
            <Link to="/upload">Upload</Link> &nbsp;·&nbsp; <Link to="/retrieve">Retrieve</Link>
          </p>
        </footer>
      </div>
    </>
  );
}
