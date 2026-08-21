'use client';

import { useRef, useState } from 'react';
import { Package, Flame, AlertTriangle, Code, Lightbulb, Timer, Shield } from 'lucide-react';
import {
  retrieveCode, getDownloadUrl, RetrieveResponse,
  formatBytes, formatExpiry, getFileTypeIcon,
} from '../../lib/api-client';

export default function RetrievePage() {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RetrieveResponse | null>(null);
  const [error, setError] = useState('');
  // Single ref array — avoids calling useRef inside a loop (Rules of Hooks)
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  const focusAt = (i: number) => inputRefs.current[i]?.focus();
  const setRef = (i: number) => (el: HTMLInputElement | null) => { inputRefs.current[i] = el; };

  const code = digits.join('');

  // ── Digit input handling (auto-advance, backspace, paste) ───────────────────
  const handleDigitChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 5) focusAt(i + 1);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) focusAt(i - 1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      focusAt(5);
      e.preventDefault();
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleRetrieve = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await retrieveCode(code);
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Code not found or expired.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDigits(Array(6).fill(''));
    setResult(null);
    setError('');
    focusAt(0);
  };

  // ── Result view ─────────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="container" style={{ maxWidth: 640, paddingTop: 40, paddingBottom: 80 }}>
        <div className="page-header" style={{ padding: '20px 0 24px' }}>
          <h1><Package size={32} className="inline mr-2 text-success" /> Files Found!</h1>
          <p>
            Code{' '}
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-2)', fontWeight: 700 }}>
              {result.code}
            </span>
            {' '}· Expires in{' '}
            <span style={{ color: 'var(--accent-2)', fontWeight: 600 }}>
              {formatExpiry(result.expiresAt)}
            </span>
            {result.burnAfterRead && (
              <span style={{ color: 'var(--error)', marginLeft: 8 }}><Flame size={14} className="inline" /> Burn after read</span>
            )}
          </p>
        </div>

        {result.burnAfterRead && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <AlertTriangle size={16} className="inline mr-2" /> These files will be permanently deleted after download!
          </div>
        )}

        <div className="download-list">
          {result.files.map((f, i) => (
            <div key={i} className="download-card">
              <div className="download-file-icon">{getFileTypeIcon(f.filename, f.fileType)}</div>
              <div className="download-file-info">
                <div className="download-file-name">
                  {f.filename}
                  {f.fileType === 'code' && (
                    <span className="download-code-badge"><Code size={12} className="inline mr-1" /> code</span>
                  )}
                </div>
                <div className="download-file-meta">{formatBytes(f.size)} · {f.mimetype}</div>
              </div>
              <a
                id={`download-btn-${i}`}
                href={getDownloadUrl(result.code, i)}
                download={f.filename}
                className="btn btn-teal btn-sm"
                style={{ flexShrink: 0 }}
              >
                ↓ Download
              </a>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">Total downloads</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
              {result.downloadCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-4">
            <span className="text-secondary">Files available</span>
            <span style={{ fontWeight: 700 }}>{result.files.length}</span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button id="retrieve-another-btn" className="btn btn-secondary btn-full" onClick={reset}>
            ← Enter Another Code
          </button>
          <a href="/upload" id="go-upload-btn" className="btn btn-primary btn-full">
            ↑ Upload Files
          </a>
        </div>
      </div>
    );
  }

  // ── Code entry view ─────────────────────────────────────────────────────────
  return (
    <div className="container" style={{ maxWidth: 520, paddingTop: 40, paddingBottom: 80 }}>
      <div className="page-header" style={{ padding: '20px 0 8px' }}>
        <h1>Retrieve <span className="text-gradient">Files</span></h1>
        <p>Enter the 6-digit code you received to access your files.</p>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="text-center" style={{ marginBottom: 8 }}>
          <span style={{
            fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>
            Enter 6-digit access code
          </span>
        </div>

        <div className="digit-inputs" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={setRef(i)}
              id={`digit-input-${i}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={d}
              placeholder="·"
              className="digit-input"
              aria-label={`Digit ${i + 1} of 6`}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>

        <p className="text-center text-xs text-muted flex items-center justify-center gap-1" style={{ marginBottom: 20 }}>
          <Lightbulb size={14} /> Paste the code directly into any box to auto-fill all digits
        </p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }} role="alert">
            <AlertTriangle size={16} className="inline mr-2" /> {error}
          </div>
        )}

        <button
          id="retrieve-submit-btn"
          className="btn btn-primary btn-full btn-lg"
          onClick={handleRetrieve}
          disabled={code.length !== 6 || loading}
        >
          {loading ? (
            <>
              <svg className="progress-ring" width="18" height="18" viewBox="0 0 18 18">
                <circle cx="9" cy="9" r="7" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                <circle cx="9" cy="9" r="7" fill="none" stroke="white" strokeWidth="2"
                  strokeDasharray="44" strokeDashoffset="33" strokeLinecap="round" />
              </svg>
              Searching…
            </>
          ) : '↓ Retrieve Files'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
        <div className="card card-sm" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}><Timer size={24} color="var(--accent-1)" /></div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>24h Expiry</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Codes auto-delete after 24 hours</div>
        </div>
        <div className="card card-sm" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}><Shield size={24} color="var(--accent-1)" /></div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Rate Limited</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>5 attempts / min to prevent brute-force</div>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-secondary">
          Don&apos;t have a code?{' '}
          <a href="/upload" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>Upload files →</a>
        </p>
      </div>
    </div>
  );
}
