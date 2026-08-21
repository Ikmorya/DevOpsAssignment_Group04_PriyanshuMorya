import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'FileVault — Secure File Sharing with 6-Digit Codes',
  description: 'Upload files and share them instantly with a secure 6-digit access code. No account needed to retrieve files. Files auto-expire after 24 hours.',
  keywords: ['file sharing', 'secure upload', 'temporary files', '6-digit code', 'file transfer'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="mesh-bg">
          <div className="mesh-blob-3" />
        </div>
        <div className="page-wrapper">
          <nav className="navbar">
            <div className="navbar-inner">
              <Link href="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Image
                  src="/logo.png"
                  alt="DROPP Logo"
                  width={280}
                  height={120}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </Link>
              <div className="navbar-links">
                <Link href="/upload" className="nav-link" id="nav-upload">Upload</Link>
                <Link href="/retrieve" className="nav-link" id="nav-retrieve">Retrieve</Link>
              </div>
            </div>
          </nav>
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <footer className="footer">
            <p>
              Built with 💜  &nbsp;·&nbsp; Files auto-expire in 24h &nbsp;·&nbsp;
              <Link href="/upload">Upload</Link> &nbsp;·&nbsp; <Link href="/retrieve">Retrieve</Link>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
