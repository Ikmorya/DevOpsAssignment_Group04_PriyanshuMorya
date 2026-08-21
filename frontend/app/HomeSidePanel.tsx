'use client';

import { useEffect, useRef } from 'react';

const UPLOAD_TIPS = [
  { label: 'Start', text: 'No account needed. Just open and upload.' },
  { label: 'Drop', text: 'Drag files onto the zone — it highlights instantly.' },
  { label: 'Browse', text: 'Or click the zone to pick files from your device.' },
  { label: 'Limit', text: 'Up to 50MB per file. Up to 20 files per code.' },
  { label: 'Types', text: 'Any format accepted — images, zips, executables.' },
  { label: 'Badge', text: '.js, .py, .go files get an automatic code badge.' },
  { label: 'Burn', text: 'Burn After Read: files vanish after first download.' },
  { label: 'Code', text: 'Codes use crypto.randomInt — never guessable.' },
  { label: 'Upload', text: 'Live progress bar tracks your upload in real time.' },
  { label: 'Share', text: 'Share the 6-digit code via text, email, or voice.' },
  { label: 'Expiry', text: 'Everything auto-deletes after exactly 24 hours.' },
  { label: 'Privacy', text: 'Zero IP logs. Zero account data. Fully anonymous.' },
];

const RETRIEVE_TIPS = [
  { label: 'Code', text: 'All you need is a 6-digit code from the sender.' },
  { label: 'Paste', text: 'Paste the code into any box — all 6 fill at once.' },
  { label: 'Auto', text: 'Cursor advances automatically after each digit.' },
  { label: 'Back', text: 'Backspace moves to the previous box to correct.' },
  { label: 'Search', text: 'Hit Retrieve — results appear in under a second.' },
  { label: 'List', text: 'See all files: name, size, type. Download any.' },
  { label: 'Repeat', text: 'Download as many times as you want within 24h.' },
  { label: 'Burn', text: 'Burn-mode: first download deletes all files forever.' },
  { label: 'Guard', text: '5 attempts per minute stops brute-force attacks.' },
  { label: 'Space', text: '1,000,000 codes — brute-force takes years.' },
  { label: 'Timer', text: 'See the exact countdown before a code expires.' },
  { label: 'Stats', text: 'Total download count shown on the results page.' },
];

interface Props {
  side: 'left' | 'right';
}

export default function HomeSidePanel({ side }: Props) {
  const tips = side === 'left' ? UPLOAD_TIPS : RETRIEVE_TIPS;
  const label = side === 'left' ? 'Upload Tips' : 'Retrieve Tips';
  const ALL = [...tips, ...tips, ...tips];

  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const N = tips.length;

    // Start in the middle copy
    const cardHeight = container.scrollHeight / 3;
    container.scrollTop = cardHeight;

    let scrollPos = container.scrollTop;

    const tick = () => {
      scrollPos += 0.4; // px per frame — very slow
      const oneSetHeight = container.scrollHeight / 3;

      // Seamlessly loop: when past 2nd copy start, jump back by one set
      if (scrollPos >= oneSetHeight * 2) {
        scrollPos -= oneSetHeight;
      }

      container.scrollTop = scrollPos;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tips.length]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: 420,
      opacity: 0.18,
      position: 'relative',
      userSelect: 'none',
      pointerEvents: 'none',
    }}>
      {/* Label */}
      <div style={{
        fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        textAlign: side === 'left' ? 'right' : 'left',
        marginBottom: 12,
        paddingRight: side === 'left' ? 4 : 0,
        paddingLeft: side === 'right' ? 4 : 0,
      }}>
        {label}
      </div>

      {/* Scroll container */}
      <div
        ref={containerRef}
        style={{
          height: 400,
          overflowY: 'hidden',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      >
        {ALL.map((tip, idx) => (
          <div
            key={idx}
            style={{
              padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              textAlign: side === 'left' ? 'right' : 'left',
            }}
          >
            <div style={{
              fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#a78bfa',
              marginBottom: 3,
            }}>
              {tip.label}
            </div>
            <div style={{
              fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5,
            }}>
              {tip.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
