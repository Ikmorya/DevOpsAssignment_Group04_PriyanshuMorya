import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <span>🔐</span> Secure &middot; Ephemeral &middot; Zero-Account
        </div>
        <h1 className="hero-title">
          Share Files with a{' '}
          <span className="gradient-text">6-Digit Code</span>
        </h1>
        <p className="hero-subtitle">
          Upload any file and instantly get a secure 6-digit code.
          Anyone with the code can retrieve it — no sign-up, no hassle.
          Files vanish after 24 hours.
        </p>
        <div className="hero-actions">
          <Link href="/upload" className="btn btn-primary btn-lg" id="hero-upload-btn">
            ↑ &nbsp;Upload Files
          </Link>
          <Link href="/retrieve" className="btn btn-secondary btn-lg" id="hero-retrieve-btn">
            ↓ &nbsp;Retrieve Files
          </Link>
        </div>

        {/* Floating code preview */}
        <div style={{ marginTop: 16 }}>
          <div className="code-card" style={{ display: 'inline-block', padding: '28px 40px' }}>
            <div className="code-label">Your access code</div>
            <div className="code-digits">
              {['4','8','3','9','2','0'].map((d, i) => (
                <div key={i} className="code-digit" style={{ animationDelay: `${i * 0.07}s` }}>{d}</div>
              ))}
            </div>
            <div className="code-expiry">Expires in <span>23h 59m</span></div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="container">
        <div className="stats-strip">
          <div className="stat-item">
            <div className="stat-value">6</div>
            <div className="stat-label">Digit Code</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">24h</div>
            <div className="stat-label">Auto Expiry</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">50MB</div>
            <div className="stat-label">Max File Size</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">20</div>
            <div className="stat-label">Files per Code</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon feature-icon-violet">🔐</div>
            <div className="feature-title">Cryptographically Secure</div>
            <p className="feature-desc">
              Codes generated with <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82em', color: '#a78bfa' }}>crypto.randomInt</code> — never sequential, never guessable.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-teal">⏱️</div>
            <div className="feature-title">Auto-Expiring</div>
            <p className="feature-desc">
              Codes and files automatically expire after 24 hours via MongoDB TTL index — no cron jobs, zero maintenance.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-pink">🔥</div>
            <div className="feature-title">Burn After Read</div>
            <p className="feature-desc">
              Enable one-time download mode — the file self-destructs immediately after the first retrieval.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-amber">🛡️</div>
            <div className="feature-title">Rate Limited</div>
            <p className="feature-desc">
              5 attempts per IP per minute on code entry prevents brute-force attacks on the 6-digit space.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-violet">📂</div>
            <div className="feature-title">Multiple Files</div>
            <p className="feature-desc">
              Upload up to 20 files under one code. Code and normal files both supported — code files get a special badge.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-teal">🚀</div>
            <div className="feature-title">No Account Needed</div>
            <p className="feature-desc">
              Recipients only need the 6-digit code to retrieve files. Zero friction, zero sign-ups for downloaders.
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="container" style={{ paddingBottom: 80 }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 40 }}>
          How it <span className="text-gradient">works</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          {[
            { step: '01', title: 'Upload', desc: 'Drag & drop your files. Up to 50MB each, 20 files per session.', icon: '📤' },
            { step: '02', title: 'Get Code', desc: 'Receive a unique 6-digit access code — share it with anyone.', icon: '🔢' },
            { step: '03', title: 'Retrieve', desc: 'Enter the code on the Retrieve page to download all files.', icon: '📥' },
            { step: '04', title: 'Auto-Clean', desc: 'After 24h, code and files are permanently deleted from our servers.', icon: '🗑️' },
          ].map(({ step, title, desc, icon }) => (
            <div key={step} className="card card-sm" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 12, right: 16,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem', fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
              }}>{step}</div>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
