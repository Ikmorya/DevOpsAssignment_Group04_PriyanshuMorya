import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Lock, Flame, Copy, Check, Folder, Lightbulb, UploadCloud, AlertTriangle, X } from 'lucide-react';
import DocScrollPanel from './DocScrollPanel';
import {
  uploadFiles, UploadResponse,
  formatBytes, formatExpiry, getFileTypeIcon,
} from '../../lib/api-client';

const CODE_EXTS = new Set([
  'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rb', 'php',
  'sh', 'bash', 'html', 'css', 'json', 'xml', 'yaml', 'yml', 'toml', 'rs',
  'swift', 'kt', 'sql', 'txt', 'md',
]);

function isCodeFile(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return CODE_EXTS.has(ext);
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [burnAfterRead, setBurn] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    setFiles((prev) => {
      const combined = [...prev];
      Array.from(newFiles).forEach((f) => {
        if (!combined.find((x) => x.name === f.name && x.size === f.size)) {
          combined.push(f);
        }
      });
      return combined.slice(0, 20);
    });
  }, []);

  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    setProgress(0);
    try {
      const res = await uploadFiles(files, burnAfterRead, setProgress);
      setResult(res);
      setFiles([]);
    } catch (e: unknown) {
      setError((e as Error).message || 'Upload failed. Is the backend running?');
    } finally {
      setUploading(false);
    }
  };

  const copyCode = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setResult(null); setError(''); setProgress(0); };

  // ── Result view ──────────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="container" style={{ maxWidth: 560, paddingTop: 40, paddingBottom: 80 }}>
        <div className="page-header" style={{ padding: '20px 0 32px' }}>
          <h1><CheckCircle size={32} className="inline text-success mr-2" /> Upload Complete!</h1>
          <p>Share the 4 charcode below with anyone to let them download your files.</p>
        </div>

        <div className="code-card">
          <div className="code-label"><Lock size={16} className="inline mr-1" /> Your secure access code</div>
          <div className="code-digits">
            {result.code.split('').map((d, i) => (
              <div key={i} className="code-digit">{d}</div>
            ))}
          </div>
          <div className="code-expiry">
            Auto-deletes in <span>{formatExpiry(result.expiresAt)}</span>
            {burnAfterRead && <> &nbsp;·&nbsp; <span style={{ color: 'var(--error)' }}><Flame size={14} className="inline" /> Burn after read</span></>}
          </div>
          <div className="code-copy-btn">
            <button
              id="copy-code-btn"
              className={`btn ${copied ? 'btn-teal' : 'btn-secondary'}`}
              onClick={copyCode}
              style={{ minWidth: 160 }}
            >
              {copied ? <><Check size={18} className="inline mr-1" /> Copied!</> : <><Copy size={18} className="inline mr-1" /> Copy Code</>}
            </button>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><Folder size={18} /> {result.fileCount} file{result.fileCount !== 1 ? 's' : ''} uploaded</span>
          </div>
          <div className="alert alert-info" style={{ fontSize: '0.82rem' }}>
            <Lightbulb size={16} className="inline mr-1" /> Tip: Send this code via message. Anyone can retrieve files at <strong>dropp.app/retrieve</strong>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button id="upload-another-btn" className="btn btn-primary btn-full" onClick={reset}>
            ↑ Upload More Files
          </button>
          <Link to="/retrieve" id="go-retrieve-btn" className="btn btn-secondary btn-full">
            ↓ Retrieve Files
          </Link>
        </div>
      </div>
    );
  }

  // ── Upload view ──────────────────────────────────────────────────────────────
  return (
    <div className="two-col-layout">

      {/* ── LEFT: 3D Documentation Panel ─────────────────────── */}
      <div className="two-col-left">
        <DocScrollPanel />
      </div>

      {/* ── RIGHT: Upload Form ──────────────────────────────────── */}
      <div className="two-col-right">
        <div className="page-header" style={{ padding: '0 0 28px', textAlign: 'left' }}>
          <h1>Upload <span className="text-gradient">Files</span></h1>
          <p style={{ textAlign: 'left' }}>Drag and drop your files below. You'll get a 4 charcode to share.</p>
        </div>

        {/* Drop zone */}
        <div
          id="upload-dropzone"
          className={`upload-area ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="File drop zone"
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          <div className="upload-icon" style={{ display: 'flex', justifyContent: 'center' }}>
            {dragOver ? <UploadCloud size={48} color="var(--accent-1)" /> : <UploadCloud size={48} color="var(--text-muted)" />}
          </div>
          <div className="upload-title">
            {dragOver ? 'Drop files here' : 'Drag & drop files here'}
          </div>
          <div className="upload-subtitle">or click to browse &nbsp;·&nbsp; Max 50MB per file &nbsp;·&nbsp; Up to 20 files</div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="upload-input"
            id="file-input"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="file-list">
            {files.map((f, i) => {
              const isCode = isCodeFile(f.name);
              return (
                <div key={i} className="file-item">
                  <div className="file-icon">{getFileTypeIcon(f.name, isCode ? 'code' : 'normal')}</div>
                  <div className="file-info">
                    <div className="file-name">{f.name}</div>
                    <div className="file-meta">{formatBytes(f.size)}</div>
                  </div>
                  <span className={`file-badge ${isCode ? 'file-badge-code' : 'file-badge-normal'}`}>
                    {isCode ? 'code' : 'file'}
                  </span>
                  <button
                    className="file-remove"
                    onClick={() => removeFile(i)}
                    aria-label={`Remove ${f.name}`}
                    id={`remove-file-${i}`}
                  ><X size={16} /></button>
                </div>
              );
            })}
          </div>
        )}

        {/* Options */}
        <div className="card" style={{ marginTop: 24 }}>
          <div className="toggle-row" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className="toggle-label">
              <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Flame size={16} color="var(--error)" /> Burn after read</strong>
              Files delete permanently after first download
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                id="burn-after-read-toggle"
                checked={burnAfterRead}
                onChange={(e) => setBurn(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Progress */}
        {uploading && (
          <div className="card mt-4" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Uploading{' '}
              <span className="loading-dots">
                <span /><span /><span />
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--accent-1), var(--accent-2))',
                borderRadius: 99,
                transition: 'width 0.2s ease',
              }} />
            </div>
            <div style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {progress}%
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error mt-4" role="alert">
            <AlertTriangle size={16} className="inline mr-1" /> {error}
          </div>
        )}

        {/* Submit */}
        <button
          id="upload-submit-btn"
          className="btn btn-primary btn-full btn-lg mt-6"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
        >
          {uploading ? (
            <>
              <svg className="progress-ring" width="18" height="18" viewBox="0 0 18 18">
                <circle cx="9" cy="9" r="7" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                <circle cx="9" cy="9" r="7" fill="none" stroke="white" strokeWidth="2"
                  strokeDasharray="44" strokeDashoffset="33" strokeLinecap="round" />
              </svg>
              Uploading…
            </>
          ) : (
            <>↑ &nbsp;Upload {files.length > 0 ? `${files.length} File${files.length !== 1 ? 's' : ''}` : 'Files'}</>
          )}
        </button>
      </div>
    </div>
  );
}
