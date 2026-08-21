'use client';

import { useEffect, useRef, useCallback } from 'react';

const DOC_STEPS = [
  {
    step: '01', tag: 'Start',
    title: 'Open the Upload Page',
    desc: 'Navigate to the Upload page from the nav bar. No login, no email, no account required. Just open and go.',
  },
  {
    step: '02', tag: 'Files',
    title: 'Drag & Drop Files',
    desc: 'Drag one or multiple files directly onto the dashed drop zone. The zone highlights in violet when a valid drag is detected.',
  },
  {
    step: '03', tag: 'Files',
    title: 'Or Click to Browse',
    desc: 'Prefer using a file picker? Click anywhere on the drop zone to open your OS file browser and select files manually.',
  },
  {
    step: '04', tag: 'Limits',
    title: 'File Size Limit',
    desc: 'Each individual file can be up to 50MB. If a file exceeds this, it will be rejected. There\'s no combined size cap.',
  },
  {
    step: '05', tag: 'Limits',
    title: 'Max 20 Files at Once',
    desc: 'You can bundle up to 20 files under a single 6-digit code. All files are linked to the same code and expire together.',
  },
  {
    step: '06', tag: 'Types',
    title: 'All File Types Accepted',
    desc: 'Any format is supported — PDFs, ZIPs, images, videos, executables, raw data. No file type is blocked.',
  },
  {
    step: '07', tag: 'Types',
    title: 'Code Files Get a Badge',
    desc: 'Files with extensions like .js, .py, .go, .ts, .java, .sql automatically receive a \'code\' badge in the file list.',
  },
  {
    step: '08', tag: 'Review',
    title: 'Review Your File List',
    desc: 'Added files appear in a list below the drop zone. Each entry shows the filename and size. Remove any by clicking ×.',
  },
  {
    step: '09', tag: 'Security',
    title: 'Burn After Read Option',
    desc: 'Toggle "Burn after read" to make all files under this code permanently deleted after the very first download.',
  },
  {
    step: '10', tag: 'Security',
    title: 'Cryptographic Code',
    desc: 'Your 6-digit code is generated using Node\'s crypto.randomInt — never sequential, never predictable, never reused.',
  },
  {
    step: '11', tag: 'Upload',
    title: 'Hit Upload',
    desc: 'Press the Upload button. A live progress bar tracks your transfer. Multiple files upload in parallel for speed.',
  },
  {
    step: '12', tag: 'Upload',
    title: 'Upload Progress',
    desc: 'A progress bar fills from 0–100% as your files upload. The % counter updates in real time during transfer.',
  },
  {
    step: '13', tag: 'Code',
    title: 'Receive Your Code',
    desc: 'Once done, a 6-digit access code is displayed in a large card. This is the only credential needed to retrieve your files.',
  },
  {
    step: '14', tag: 'Code',
    title: 'Copy & Share',
    desc: 'Tap "Copy Code" to copy the 6 digits to your clipboard. Share it over any channel — text, email, voice, anything.',
  },
  {
    step: '15', tag: 'Expiry',
    title: 'Auto-Expiry in 24 Hours',
    desc: 'All files and the access code are automatically deleted from our servers exactly 24 hours after upload. No action needed.',
  },
  {
    step: '16', tag: 'Privacy',
    title: 'Zero Data Retention',
    desc: 'We store no metadata about you — no IP logs, no account info, no file names in analytics. Your upload is completely anonymous.',
  },
];

export default function DocScrollPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const applyTransforms = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerMidY = containerRect.top + containerRect.height / 2;

    cardRefs.current.forEach((card) => {
      if (!card) return;
      const cardRect = card.getBoundingClientRect();
      const cardMidY = cardRect.top + cardRect.height / 2;

      // Distance from center: -1 (far above) to +1 (far below)
      const distance = (cardMidY - containerMidY) / (containerRect.height * 0.5);
      const clampedDist = Math.max(-1.4, Math.min(1.4, distance));

      const absD = Math.abs(clampedDist);

      // Scale: center=1, edges=0.88 — very subtle
      const scale = 1 - absD * 0.1;
      // Opacity: center=1, edges=0.25 — smooth fade
      const opacity = 1 - absD * 0.65;
      // Gentle tilt — much lower than before
      const rotateX = clampedDist * 8;
      // Subtle Z depth
      const translateZ = -absD * 30;

      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) scale(${scale}) translateZ(${translateZ}px)`;
      card.style.opacity = String(Math.max(0.12, opacity));
      card.style.filter = absD > 0.6 ? `blur(${(absD - 0.6) * 1.2}px)` : 'none';
      card.style.zIndex = String(Math.round((1 - absD) * 10));
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const N = DOC_STEPS.length;

    // Start at card 2 of the MIDDLE copy (index N+1)
    const startCard = cardRefs.current[N + 1];
    if (startCard) {
      container.scrollTop = startCard.offsetTop - container.clientHeight / 2 + startCard.clientHeight / 2;
    }
    applyTransforms();

    const handleScroll = () => {
      applyTransforms();
      const c0 = cardRefs.current[0];
      const cN = cardRefs.current[N];
      const c2N = cardRefs.current[N * 2];
      if (!c0 || !cN || !c2N) return;

      const setHeight = cN.offsetTop - c0.offsetTop;

      // Scrolled deep into the first copy — jump forward
      if (container.scrollTop < cN.offsetTop - container.clientHeight * 1.2) {
        container.scrollTop += setHeight;
      }
      // Scrolled deep into the third copy — jump back
      if (container.scrollTop > c2N.offsetTop - container.clientHeight * 0.3) {
        container.scrollTop -= setHeight;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', applyTransforms, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', applyTransforms);
    };
  }, [applyTransforms]);

  const ALL_CARDS = [...DOC_STEPS, ...DOC_STEPS, ...DOC_STEPS];

  return (
    <div style={{ position: 'relative' }}>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '4px 12px', borderRadius: 99,
          background: 'rgba(124, 58, 237, 0.12)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase' as const, color: '#a78bfa', marginBottom: 12,
        }}>
          Documentation
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          How to use <span className="gradient-text">DROPP</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 6, lineHeight: 1.6 }}>
          Scrolls infinitely ↻
        </p>
      </div>

      {/* 3D Scroll Wheel Container */}
      <div style={{ position: 'relative' }}>
        {/* Scrollable area — mask-image handles the fade */}
        <div
          ref={containerRef}
          style={{
            height: 420,
            overflowY: 'scroll',
            scrollSnapType: 'y mandatory',
            WebkitOverflowScrolling: 'touch' as any,
            scrollbarWidth: 'none' as any,
            position: 'relative',
            zIndex: 10,
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
          }}
          className="doc-wheel-scroll"
        >
          {/* Spacer top */}
          <div style={{ height: 155, flexShrink: 0 }} />

          {ALL_CARDS.map((item, idx) => (
            <div
              key={idx}
              ref={(el) => { cardRefs.current[idx] = el; }}
              style={{
                scrollSnapAlign: 'center',
                padding: '16px 18px',
                marginBottom: 10,
                background: 'transparent',
                border: 'none',
                borderRadius: 16,
                transition: 'transform 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.18s ease, filter 0.18s ease',
                willChange: 'transform, opacity',
                transformOrigin: 'center center',
                cursor: 'default',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 9,
                  background: 'rgba(124, 58, 237, 0.18)',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.62rem', fontWeight: 700, color: '#a78bfa', flexShrink: 0,
                }}>
                  {item.step}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{item.title}</span>
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px',
                      borderRadius: 99, background: 'rgba(255,255,255,0.07)',
                      color: 'var(--text-muted)', letterSpacing: '0.06em',
                      whiteSpace: 'nowrap' as const, textTransform: 'uppercase' as const,
                    }}>
                      {item.tag}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.79rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Spacer bottom */}
          <div style={{ height: 155, flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}
