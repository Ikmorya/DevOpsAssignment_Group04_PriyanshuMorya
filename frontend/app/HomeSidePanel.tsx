'use client';

const COL_A = [
  { title: 'Drag & Drop', desc: 'Drop any file onto the upload zone — it highlights on hover.' },
  { title: 'Max 50MB', desc: 'Each individual file supports up to 50MB per upload session.' },
  { title: 'Burn After Read', desc: 'Files self-destruct permanently after the first download.' },
  { title: 'Crypto Code', desc: 'Generated with crypto.randomInt — never sequential or guessable.' },
  { title: 'Auto Expiry', desc: 'All files and codes are purged after exactly 24 hours.' },
  { title: 'Zero Account', desc: 'No sign-up, no email, no password — completely anonymous.' },
  { title: '20 Files Max', desc: 'Bundle up to 20 files under a single 6-digit access code.' },
  { title: 'Live Progress', desc: 'A real-time progress bar tracks your upload percentage.' },
];

const COL_B = [
  { title: 'Paste Code', desc: 'Paste all 6 digits at once — auto-fills every input box.' },
  { title: 'Rate Limited', desc: '5 retrieval attempts per IP per minute prevent brute-force.' },
  { title: 'Code Badge', desc: '.js .py .go .ts files automatically receive a code badge.' },
  { title: 'Any Format', desc: 'PDFs, ZIPs, executables, images — no file type is blocked.' },
  { title: 'Instant Share', desc: 'Share the 6-digit code via text, email, or voice call.' },
  { title: 'No Metadata', desc: 'Zero IP logs, zero analytics, zero file name tracking.' },
  { title: 'Download Count', desc: 'See how many times files have been downloaded in results.' },
  { title: 'TTL Index', desc: 'MongoDB TTL index auto-purges data — no cron jobs needed.' },
];

const COL_C = [
  { title: 'Auto Advance', desc: 'Cursor moves to the next digit box automatically as you type.' },
  { title: '1M Codes', desc: 'One million possible codes — brute-force takes years to crack.' },
  { title: 'Expiry Timer', desc: 'Countdown timer shows exactly when a code will be deleted.' },
  { title: 'Copy Code', desc: 'Tap Copy Code to send it to your clipboard in one click.' },
  { title: 'Glass UI', desc: 'Glassmorphism interface with dark mode and smooth animations.' },
  { title: 'Horizontal Scale', desc: 'Stateless backend — can scale to multiple nodes instantly.' },
  { title: 'Backspace Nav', desc: 'Backspace on an empty box moves back to correct a digit.' },
  { title: 'File Preview', desc: 'Review all selected files before uploading — remove any easily.' },
];

interface ColProps {
  cards: { title: string; desc: string }[];
  duration: number;
  delay?: number;
}

function ScrollColumn({ cards, duration, delay = 0 }: ColProps) {
  const ALL = [...cards, ...cards]; // 2 copies for seamless loop
  return (
    <div style={{ overflow: 'hidden', height: '100%', flex: 1 }}>
      <div style={{
        animation: `bg-col-up ${duration}s linear ${delay}s infinite`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {ALL.map((card, i) => (
          <div key={i} style={{
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            padding: '14px 16px',
            background: 'rgba(255,255,255,0.02)',
            flexShrink: 0,
          }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: '#a78bfa', marginBottom: 5,
            }}>
              {card.title}
            </div>
            <div style={{
              fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55,
            }}>
              {card.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BackgroundTicker() {
  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        display: 'flex',
        gap: 16,
        padding: '0 24px',
        opacity: 0.07,
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
      }}>
        <ScrollColumn cards={COL_A} duration={38} delay={0} />
        <ScrollColumn cards={COL_B} duration={46} delay={-12} />
        <div className="bg-col-3" style={{ flex: 1, height: '100%' }}>
          <ScrollColumn cards={COL_C} duration={41} delay={-6} />
        </div>
      </div>

      <style>{`
        @keyframes bg-col-up {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </>
  );
}
