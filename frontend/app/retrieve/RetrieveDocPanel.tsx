'use client';

import { useEffect, useRef, useCallback } from 'react';

const RETRIEVE_STEPS = [
  {
    step: '01', tag: 'Start',
    title: 'Get the 4 Charcode',
    desc: 'Ask the sender for the 4 charcode access code they received after uploading. This is the only thing you need — no link, no account.',
  },
  {
    step: '02', tag: 'Start',
    title: 'Open the Retrieve Page',
    desc: 'Click "Retrieve" in the navigation bar. No sign-in required. The page is immediately ready to accept a code.',
  },
  {
    step: '03', tag: 'Input',
    title: 'Enter Characters One by One',
    desc: 'Click the first box and type your code. The cursor automatically advances to the next box after each character — just type straight through.',
  },
  {
    step: '04', tag: 'Input',
    title: 'Paste the Entire Code',
    desc: 'You can paste all 4 charcode at once — click any box, then paste. The app auto-fills all four boxes instantly.',
  },
  {
    step: '05', tag: 'Input',
    title: 'Backspace Navigation',
    desc: 'Made a typo? Backspace on an empty box moves you back to the previous digit so you can correct it without starting over.',
  },
  {
    step: '06', tag: 'Lookup',
    title: 'Hit Retrieve',
    desc: 'Once all 4 charcode are filled, the Retrieve button activates. Tap it to look up your files. The search takes under a second.',
  },
  {
    step: '07', tag: 'Lookup',
    title: 'What Happens Next',
    desc: 'The server verifies the code against its database. If valid and unexpired, it returns a list of all files linked to that code.',
  },
  {
    step: '08', tag: 'Results',
    title: 'See Your File List',
    desc: 'All files under the code appear as download cards — showing filename, size, MIME type, and a code badge if it\'s source code.',
  },
  {
    step: '09', tag: 'Download',
    title: 'Download Individual Files',
    desc: 'Each file has its own Download button. Click it to download that specific file. You can download files in any order.',
  },
  {
    step: '10', tag: 'Download',
    title: 'No Bulk Download Limit',
    desc: 'You can download any or all files as many times as you want during the 24-hour window — unless Burn After Read is active.',
  },
  {
    step: '11', tag: 'Security',
    title: 'Burn After Read Warning',
    desc: 'If the sender enabled Burn After Read, a warning banner appears. After the first download of any file, all files are permanently deleted.',
  },
  {
    step: '12', tag: 'Security',
    title: 'Rate Limiting Protection',
    desc: 'Only 5 code retrieval attempts are allowed per IP per minute. This blocks automated brute-force guessing of 4 charcode codes.',
  },
  {
    step: '13', tag: 'Security',
    title: 'Code Space is Vast',
    desc: 'With over 800,000 possible codes and rate limiting active, brute-forcing a single valid code would take years.',
  },
  {
    step: '14', tag: 'Expiry',
    title: 'Codes Expire After 24h',
    desc: 'Every code and its files are automatically purged 24 hours after upload via a MongoDB TTL index. Expired codes return "Not Found".',
  },
  {
    step: '15', tag: 'Expiry',
    title: 'Check the Expiry Timer',
    desc: 'On the results page, an expiry countdown shows exactly how much time is left before the code and files are permanently deleted.',
  },
  {
    step: '16', tag: 'Stats',
    title: 'Download Count',
    desc: 'The results card also shows the total number of times files under this code have been downloaded across all sessions.',
  },
];

export default function RetrieveDocPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ALL_CARDS = [...RETRIEVE_STEPS, ...RETRIEVE_STEPS, ...RETRIEVE_STEPS];

  const applyTransforms = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerMidY = containerRect.top + containerRect.height / 2;

    cardRefs.current.forEach((card) => {
      if (!card) return;
      const cardRect = card.getBoundingClientRect();
      const cardMidY = cardRect.top + cardRect.height / 2;

      const distance = (cardMidY - containerMidY) / (containerRect.height * 0.5);
      const clampedDist = Math.max(-1.4, Math.min(1.4, distance));
      const absD = Math.abs(clampedDist);

      const scale = 1 - absD * 0.1;
      const opacity = 1 - absD * 0.65;
      const rotateX = clampedDist * 8;
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
    const N = RETRIEVE_STEPS.length;

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

      // Scrolled into first copy — jump forward
      if (container.scrollTop < cN.offsetTop - container.clientHeight * 1.2) {
        container.scrollTop += setHeight;
      }
      // Scrolled into third copy — jump back
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
          How to <span className="gradient-text">Retrieve</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 6, lineHeight: 1.6 }}>
        Scrolls infinitely ↻
        </p>
      </div>

      {/* 3D Scroll Wheel */}
      <div style={{ position: 'relative' }}>
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

      <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 12, letterSpacing: '0.04em' }}>
        ↕ scroll to explore
      </p>
    </div>
  );
}
