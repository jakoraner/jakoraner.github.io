// LauraTimeline.js
// A surprise page for Laura's bachelor graduation: a retro CRT boot intro that
// opens into a Kodak-disposable-camera film-strip timeline of our relationship,
// where each photo "develops" as you scroll past it.
//
// Recreated from design_handoff_laura_timeline/ (Laura.dc.html is the source of
// truth). Full-bleed immersive route at /#/laura — does not render the Navbar.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './laura.css';
import firstDatePhoto from '../../assets/laura/first-date.jpg';
import parkPhoto from '../../assets/laura/park.jpg';
import nightLeatherPhoto from '../../assets/laura/night-leather.jpg';
import christmasPhoto from '../../assets/laura/christmas.jpg';
import touristsPhoto from '../../assets/laura/cph-tourists.jpg';
import bridgePhoto from '../../assets/laura/cph-bridge.jpg';
import flyingPhoto from '../../assets/laura/cph-flying.jpg';
import istanbul1Photo from '../../assets/laura/istanbul-1.jpg';
import istanbul2Photo from '../../assets/laura/istanbul-2.jpg';
import vietnamPhoto from '../../assets/laura/vietnam-plane.jpg';
import olderPhoto from '../../assets/laura/who-is-older.jpg';

// ── Final design choices (the handoff's three "design explorations") ─────────
const INTRO_STYLE = 'crt';      // 'crt' | 'cartridge'
const PHOTO_STYLE = 'polaroid'; // 'polaroid' | 'filmstrip'
const HUMOR = 'warm';           // 'goofy' | 'warm' | 'subtle'

// localStorage key for the live graduation capture (last frame). Bump the
// version suffix to reset the slot back to its empty "tap to add" state so the
// real photo can be taken fresh at the bachelor graduation.
const GRAD_PHOTO_KEY = 'laura-grad-photo-2026-06';

// ── Boot sequence text ───────────────────────────────────────────────────────
const GREEN = '#86d36b';
const RED = '#ff5a4d';
const BLUE = '#67c9ff';
const tag = (color) => ({ color, whiteSpace: 'nowrap', fontWeight: 700, textShadow: '0 0 8px currentColor' });

const BOOT = [
  { pre: 'LAURA OS  v1.0  —  ROMance edition', tag: '', tagStyle: {} },
  { pre: '© 2025  JACOB × LAURA SYSTEMS', tag: '', tagStyle: {} },
  { pre: 'initializing  heart.sys', tag: 'OK', tagStyle: tag(GREEN) },
  { pre: 'loading memories  (3,287 photos)', tag: 'OK', tagStyle: tag(GREEN) },
  { pre: 'mounting  /dev/feelings', tag: 'OK', tagStyle: tag(GREEN) },
  { pre: 'calibrating  disposable camera', tag: 'OK', tagStyle: tag(GREEN) },
  { pre: 'scanning  for red flags', tag: 'NONE', tagStyle: tag(BLUE) },
  { pre: 'WARNING: extreme cuteness detected', tag: '!!', tagStyle: tag(RED) },
  { pre: 'system  READY', tag: '', tagStyle: {} },
];

// ── Milestone data ───────────────────────────────────────────────────────────
// `date` is the orange film date-stamp. kind 'photo' uses a bundled image;
// kind 'slot' is a styled placeholder. The 'm-grad' slot is special: it's the
// live camera-capture frame (see the graduation rendering below).
//
// To fill an empty slot later: import the photo at the top, then change that
// milestone to  { ..., kind: 'photo', src: yourImport }  — done.
// Ordered chronologically. Dates on the camera photos are their real EXIF
// capture dates; the three originals (park/night-leather/christmas), the two
// placeholders, and the graduation frame keep their narrative dates.
const MILES = [
  {
    date: "'25 07 05", kind: 'photo', src: firstDatePhoto, title: 'FIRST DATE — KØDBYEN',
    caps: {
      goofy: 'Kødbyen, 5 July. Two idiots, one great idea. 10/10, would repeat.',
      warm: 'Our first date in Kødbyen — before it was anything, it was a maybe. Best maybe of my life.',
      subtle: 'Kødbyen, 05 July 2025. Where it all quietly began.',
    },
  },
  {
    date: "'25 08 30", kind: 'photo', src: touristsPhoto, title: 'TOURISTS IN OUR OWN CITY',
    caps: {
      goofy: 'Full tourist mode: matching squint, zero chill, one perfect harbor.',
      warm: 'Nyhavn, sunshine, and you — falling for our own city all over again.',
      subtle: 'Nyhavn. Home never looked better.',
    },
  },
  {
    date: "'25 08 30", kind: 'photo', src: bridgePhoto, title: 'ON THE BRIDGE',
    caps: {
      goofy: 'Stopped the bike mid-bridge just to stare at you. Worth the traffic.',
      warm: 'The whole harbor behind us, and I still only had eyes for you.',
      subtle: 'Copenhagen from the bridge, together.',
    },
  },
  {
    date: "'25 09 14", kind: 'photo', src: olderPhoto, title: 'FOR THE RECORD',
    caps: {
      goofy: 'The face-scanner called me 33 and you 24. Science has spoken. Rude.',
      warm: "A machine guessed me 33 and you 24 — I'll never hear the end of it, and I don't mind.",
      subtle: 'The machine had opinions about our ages.',
    },
  },
  {
    date: "'25 10 01", kind: 'photo', src: parkPhoto, title: 'OFFICIAL — 01.10.2025',
    caps: {
      goofy: 'Status: taken. The servers crashed from the cuteness overload.',
      warm: 'The day we stopped pretending we were just friends.',
      subtle: '01 October 2025. The day it became us.',
    },
  },
  {
    date: "'25 · 10", kind: 'photo', src: nightLeatherPhoto, title: 'MATCHING FITS, COPENHAGEN',
    caps: {
      goofy: 'A gang of two. Membership requires snacks and bad jokes.',
      warm: 'Leather jackets, cold air, warm hands. Our kind of night.',
      subtle: 'A night out, perfectly in sync.',
    },
  },
  {
    date: "'25 10 14", kind: 'photo', src: istanbul1Photo, title: 'ISTANBUL, UP CLOSE',
    caps: {
      goofy: 'Two faces, one phone, zero personal space. Istanbul edition.',
      warm: 'Cheek to cheek somewhere in Istanbul. My favorite kind of lost.',
      subtle: 'Istanbul, as close as it gets.',
    },
  },
  {
    date: "'25 10 15", kind: 'photo', src: istanbul2Photo, title: 'UNDER THE DOMES',
    caps: {
      goofy: 'We came for the history, stayed for the selfies.',
      warm: 'Under impossible ceilings, holding your hand. Istanbul with you.',
      subtle: 'Istanbul. Quiet awe, side by side.',
    },
  },
  {
    date: "'25 12 24", kind: 'photo', src: christmasPhoto, title: 'FIRST CHRISTMAS',
    caps: {
      goofy: 'She got the rings. I got the honor of holding the camera.',
      warm: "First tree, first lights, first 'okay, this is the one' feeling.",
      subtle: 'Our first Christmas under the lights.',
    },
  },
  {
    date: "'26 01 30", kind: 'photo', src: vietnamPhoto, title: 'VIETNAM-BOUND',
    caps: {
      goofy: 'Pre-takeoff selfie: certified plane goofballs, Vietnam-bound.',
      warm: 'Two seats, one big adventure — grinning the whole way to Vietnam.',
      subtle: 'On our way to Vietnam.',
    },
  },
  {
    date: "'26 06 07", kind: 'photo', src: flyingPhoto, title: 'FLYING AROUND COPENHAGEN',
    caps: {
      goofy: 'Gravity? Never met her. Copenhagen parkour, sort of.',
      warm: 'Caught mid-air, mid-laugh. This is what you do to me.',
      subtle: 'Off the ground, somewhere in Copenhagen.',
    },
  },
  {
    date: "'26 06 24", kind: 'slot', slotId: 'm-grad', title: 'BACHELOR: UNLOCKED 🎓',
    caps: {
      goofy: 'Dr.* Laura. (*not yet a doctor, but give her a minute.)',
      warm: 'You did the whole degree — I just did the cheering. So proud of you.',
      subtle: 'Graduation day. You earned every second of this.',
    },
  },
];

// Film-grain noise tile (inline SVG feTurbulence), copied from the handoff.
const GRAIN =
  'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")';

const IMG = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(() => {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {
      return false;
    }
  });
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduce(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', on);
    else mq.addListener(on);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', on);
      else mq.removeListener(on);
    };
  }, []);
  return reduce;
}

export default function LauraTimeline() {
  const reduce = usePrefersReducedMotion();

  const [lines, setLines] = useState([]);
  const [showBar, setShowBar] = useState(false);
  const [barFull, setBarFull] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [closing, setClosing] = useState(false);
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState({});
  const [gradPhoto, setGradPhoto] = useState(() => {
    try {
      return localStorage.getItem(GRAD_PHOTO_KEY) || '';
    } catch (_) {
      return '';
    }
  });
  const [gradFlash, setGradFlash] = useState(false);

  const stageRef = useRef(null);
  const timers = useRef([]);
  const startedRef = useRef(false);

  const after = useCallback((ms, fn) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const runBoot = useCallback(() => {
    clearTimers();
    setLines([]);
    setShowBar(false);
    setBarFull(false);
    setShowStart(false);
    BOOT.forEach((ln, i) => after(350 + i * 300, () => setLines((prev) => [...prev, ln])));
    const end = 350 + BOOT.length * 300;
    after(end + 150, () => setShowBar(true));   // mount the loading bar at width 0
    after(end + 320, () => setBarFull(true));   // ~170ms later → CSS width transition fires
    after(end + 1900, () => setShowStart(true));
  }, [after, clearTimers]);

  const start = useCallback(() => {
    if (startedRef.current || open || !showStart) return;
    startedRef.current = true;
    if (reduce) {
      setOpen(true);
      return;
    }
    setClosing(true); // applies the crtOff power-off collapse to the bezel
    after(620, () => setOpen(true));
  }, [open, showStart, reduce, after]);

  const replay = useCallback(() => {
    startedRef.current = false;
    setRevealed({});
    setClosing(false);
    setOpen(false);
    window.scrollTo(0, 0);
    runBoot();
  }, [runBoot]);

  const onGradFile = useCallback(
    (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          localStorage.setItem(GRAD_PHOTO_KEY, reader.result);
        } catch (_) {
          /* localStorage may be full or blocked — keep the in-memory copy */
        }
        setGradPhoto(reader.result);
        setGradFlash(true);
        after(700, () => setGradFlash(false));
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [after]
  );

  // Run the boot sequence on mount; clean up timers on unmount.
  useEffect(() => {
    window.scrollTo(0, 0);
    runBoot();
    return clearTimers;
  }, [runBoot, clearTimers]);

  // Match the design's body background (and restore the previous one on unmount).
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = '#ECE0C4';
    return () => {
      document.body.style.background = prev;
    };
  }, []);

  // Keyboard: Enter / Space presses START once it's visible.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && showStart && !open) {
        e.preventDefault();
        start();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [start, showStart, open]);

  // Develop-on-scroll: reveal each card once its top scrolls past 85% of the
  // viewport (the prototype's rule — robust to fast flings, unlike a fixed
  // visible-ratio gate). The IntersectionObserver just wakes us up to re-check;
  // reveals are state-driven so React re-renders never clobber the styles.
  // Only runs after the timeline opens.
  useEffect(() => {
    if (!open) return undefined;
    const root = stageRef.current;
    if (!root) return undefined;
    const cards = root.querySelectorAll('[data-frame]');
    const io = new IntersectionObserver(
      (entries) => {
        const line = window.innerHeight * 0.85;
        const hits = [];
        entries.forEach((en) => {
          if (en.boundingClientRect.top < line) {
            const f = parseInt(en.target.getAttribute('data-frame'), 10);
            if (f) hits.push(f);
            io.unobserve(en.target);
          }
        });
        if (hits.length) {
          setRevealed((prev) => {
            const next = { ...prev };
            hits.forEach((f) => {
              next[f] = true;
            });
            return next;
          });
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '0px 0px -8% 0px' }
    );
    cards.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [open]);

  const revealedFrames = Object.keys(revealed).map(Number);
  const counterText = String(revealedFrames.length ? Math.max(...revealedFrames) : 0).padStart(2, '0');
  const counterTotal = String(MILES.length).padStart(2, '0');

  // Inner content of a photo area (image / placeholder / live grad capture) + date stamp.
  const renderPhotoInner = (m) => {
    const isGrad = m.slotId === 'm-grad';
    const isSlot = m.kind === 'slot' && !isGrad;
    return (
      <>
        {m.kind === 'photo' && <img src={m.src} alt={m.title} style={IMG} />}

        {isSlot && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              textAlign: 'center',
              padding: '16px',
              background: '#1c140c',
            }}
          >
            <div style={{ fontSize: '34px', opacity: 0.75, lineHeight: 1 }}>{'🎞️'}</div>
            <div style={{ fontFamily: "'VT323',monospace", fontSize: '20px', letterSpacing: '1px', color: '#c77e12' }}>
              PHOTO TO ADD
            </div>
            <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: '12px', color: '#8a7256' }}>
              a frame waiting to be filled {'♥'}
            </div>
            <div
              style={{
                position: 'absolute',
                inset: '10px',
                border: '2px dashed rgba(242,179,61,.30)',
                borderRadius: '2px',
                pointerEvents: 'none',
              }}
            />
          </div>
        )}

        {isGrad &&
          (gradPhoto ? (
            <>
              <img
                src={gradPhoto}
                alt="Graduation"
                style={{ ...IMG, animation: reduce ? undefined : 'gradDevelop 1.6s ease forwards' }}
              />
              {gradFlash && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#fff',
                    pointerEvents: 'none',
                    animation: 'flash .6s ease-out forwards',
                  }}
                />
              )}
              <label
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '8px',
                  zIndex: 3,
                  fontFamily: "'VT323',monospace",
                  fontSize: '15px',
                  letterSpacing: '1px',
                  color: '#3a2400',
                  background: 'linear-gradient(#ffd34d,#f2a91f)',
                  borderRadius: '6px',
                  padding: '3px 9px',
                  cursor: 'pointer',
                  boxShadow: '0 3px 0 #9c6a0e',
                }}
              >
                {'↺'} retake
                <input type="file" accept="image/*" capture="environment" onChange={onGradFile} style={{ display: 'none' }} />
              </label>
            </>
          ) : (
            <label
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '16px',
                background: 'repeating-linear-gradient(45deg,#1a1209 0 14px,#241a10 14px 28px)',
                backgroundSize: '200% 200%',
                animation: reduce ? undefined : 'stripeMove 6s linear infinite',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: "'VT323',monospace",
                  fontSize: '14px',
                  color: '#ff5a4d',
                }}
              >
                <span
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: '#ff5a4d',
                    boxShadow: '0 0 8px #ff5a4d',
                    animation: reduce ? undefined : 'blink 1s step-end infinite',
                  }}
                />
                REC
              </div>
              <div style={{ fontSize: '42px', animation: reduce ? undefined : 'camBob 1.8s ease-in-out infinite' }}>
                {'📷'}
              </div>
              <div style={{ fontFamily: "'VT323',monospace", fontSize: '22px', letterSpacing: '1px', color: '#ffd34d', lineHeight: 1.1 }}>
                TAP TO ADD
                <br />
                GRADUATION PHOTO
              </div>
              <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: '12px', color: '#c9a86a' }}>
                she takes it tomorrow {'♥'}
              </div>
              <input type="file" accept="image/*" capture="environment" onChange={onGradFile} style={{ display: 'none' }} />
            </label>
          ))}

        <span
          style={{
            position: 'absolute',
            right: '9px',
            bottom: '6px',
            fontFamily: "'VT323',monospace",
            fontSize: '21px',
            letterSpacing: '1px',
            color: '#ff7a18',
            textShadow: '0 0 7px rgba(255,120,20,.85)',
          }}
        >
          {m.date}
        </span>
      </>
    );
  };

  const renderCard = (m, i) => {
    const frame = i + 1;
    const side = i % 2 === 0 ? 'L' : 'R';
    const rot = side === 'L' ? 'rotate(-1.5deg)' : 'rotate(1.6deg)';
    const shown = !!revealed[frame];
    const transition = reduce
      ? 'opacity .6s ease'
      : 'opacity 1.1s ease, filter 1.3s ease, transform 1s cubic-bezier(.2,.8,.2,1)';
    const dev = shown
      ? { opacity: 1, filter: 'none', transform: rot }
      : reduce
      ? { opacity: 0.15, filter: 'none', transform: rot }
      : { opacity: 0.12, filter: 'sepia(.9) brightness(.55) contrast(1.2) blur(3px)', transform: 'translateY(34px) scale(.96)' };

    const caption = m.caps[HUMOR] || m.caps.warm;

    if (PHOTO_STYLE === 'filmstrip') {
      const sprocket = { height: '16px', background: 'repeating-linear-gradient(to right,#cabf9c 0 9px,#0f0b06 9px 22px)' };
      return (
        <div data-frame={frame} style={{ width: 'min(430px,88%)', transition, ...dev }}>
          <div style={{ background: '#0f0b06', borderRadius: '3px', boxShadow: '0 18px 40px rgba(40,25,10,.3)', overflow: 'hidden' }}>
            <div style={sprocket} />
            <div style={{ position: 'relative', aspectRatio: '3 / 2', overflow: 'hidden', background: '#000', margin: '0 10px' }}>
              {renderPhotoInner(m)}
            </div>
            <div style={sprocket} />
          </div>
          <div style={{ fontFamily: "'VT323',monospace", color: '#b3251e', fontSize: '14px', letterSpacing: '2px', marginTop: '10px' }}>
            FRAME {frame} {'·'} {m.date}
          </div>
          <div style={{ fontFamily: "'Permanent Marker',cursive", color: '#2b2117', fontSize: 'clamp(16px,2.6vw,21px)', marginTop: '2px', lineHeight: 1.1 }}>
            {m.title}
          </div>
          <div style={{ fontFamily: "'Montserrat',sans-serif", color: '#6b5a44', fontSize: '13.5px', marginTop: '5px', lineHeight: 1.45 }}>
            {caption}
          </div>
        </div>
      );
    }

    // Polaroid (default)
    return (
      <div
        data-frame={frame}
        style={{
          width: 'min(420px,86%)',
          background: '#fbf6ea',
          padding: '14px 14px 18px',
          boxShadow: '0 18px 40px rgba(40,25,10,.28), 0 2px 0 rgba(0,0,0,.05)',
          borderRadius: '3px',
          transition,
          ...dev,
        }}
      >
        <div style={{ position: 'relative', aspectRatio: '4 / 3', background: '#000', overflow: 'hidden' }}>
          {renderPhotoInner(m)}
        </div>
        <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 'clamp(16px,2.6vw,21px)', color: '#2b2117', marginTop: '13px', lineHeight: 1.12 }}>
          {m.title}
        </div>
        <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: '13.5px', color: '#6b5a44', marginTop: '6px', lineHeight: 1.45 }}>
          {caption}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Film-grain + vignette overlays */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 5,
          pointerEvents: 'none',
          opacity: 0.09,
          mixBlendMode: 'multiply',
          backgroundImage: GRAIN,
          backgroundSize: '140px 140px',
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 4,
          pointerEvents: 'none',
          background: 'radial-gradient(120% 90% at 50% 28%, transparent 54%, rgba(60,38,12,.24) 100%)',
        }}
      />

      {/* Escape hatch back to the site */}
      <Link
        to="/"
        style={{
          position: 'fixed',
          top: '18px',
          left: '18px',
          zIndex: 40,
          fontFamily: "'VT323',monospace",
          color: '#9a7b1e',
          fontSize: '16px',
          letterSpacing: '1px',
          textDecoration: 'none',
          background: 'rgba(28,20,12,.06)',
          padding: '4px 10px',
          borderRadius: '8px',
        }}
      >
        {'←'} back
      </Link>

      {/* Frame counter */}
      <div
        style={{
          position: 'fixed',
          top: '18px',
          right: '18px',
          zIndex: 50,
          background: '#1c140c',
          border: '3px solid #3a2a17',
          borderRadius: '10px',
          padding: '8px 14px',
          boxShadow: '0 8px 20px rgba(0,0,0,.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span style={{ fontFamily: "'VT323',monospace", color: '#c77e12', fontSize: '13px', letterSpacing: '2px' }}>EXP</span>
        <span style={{ fontFamily: "'VT323',monospace", color: '#ff7a18', fontSize: '30px', lineHeight: 1, textShadow: '0 0 10px rgba(255,120,20,.7)' }}>
          {counterText}/{counterTotal}
        </span>
      </div>

      {/* Timeline (always mounted; the boot overlay sits on top until START) */}
      <main
        ref={stageRef}
        style={{ position: 'relative', zIndex: 10, minHeight: '100vh', overflow: 'hidden', paddingBottom: '30px', background: '#ECE0C4' }}
      >
        <div
          style={{
            height: '30px',
            background: '#15110b',
            backgroundImage: 'repeating-linear-gradient(to right,#cabf9c 0 11px,#15110b 11px 30px)',
            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,.5)',
          }}
        />

        <header style={{ textAlign: 'center', padding: '70px 20px 26px' }}>
          <div style={{ fontFamily: "'VT323',monospace", color: '#9a7b1e', letterSpacing: '5px', fontSize: '17px' }}>
            {'■'} LAURA OS {'·'} CAMERA ROLL {'·'} 2025{'—'}2026
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '.01em', margin: '8px 0 0' }}>
            {'LAURA'.split('').map((ch, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  fontFamily: "'Anton',sans-serif",
                  fontSize: 'clamp(72px,16vw,190px)',
                  lineHeight: 0.9,
                  color: '#b3251e',
                  textShadow: '5px 5px 0 #f2b33d, 10px 10px 0 rgba(43,33,23,.18)',
                  letterSpacing: '2px',
                  opacity: reduce || open ? 1 : 0,
                  animation: open && !reduce ? `letterDrop .55s cubic-bezier(.34,1.56,.64,1) ${i * 0.08}s both` : 'none',
                }}
              >
                {ch}
              </span>
            ))}
          </div>
          <p style={{ fontFamily: "'Montserrat',sans-serif", color: '#6b5a44', fontSize: 'clamp(15px,2.4vw,18px)', maxWidth: '440px', margin: '18px auto 0', lineHeight: 1.5 }}>
            Our story, one exposure at a time {'—'} roll loaded 01 {'·'} 10 {'·'} 2025.
          </p>
          <div style={{ fontFamily: "'VT323',monospace", color: '#b3251e', fontSize: '20px', letterSpacing: '2px', marginTop: '18px' }}>
            {'↓'} wind the film {'↓'}
          </div>
        </header>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '980px', margin: '0 auto', padding: '14px 18px 0' }}>
          <div className="laura-center-strip" />
          {MILES.map((m, i) => {
            const side = i % 2 === 0 ? 'L' : 'R';
            return (
              <div
                key={m.slotId || m.src || i}
                style={{
                  position: 'relative',
                  display: 'flex',
                  width: '100%',
                  marginBottom: '70px',
                  minHeight: '70px',
                  justifyContent: side === 'L' ? 'flex-start' : 'flex-end',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '14px',
                    transform: 'translateX(-50%)',
                    zIndex: 6,
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: '#b3251e',
                    border: '4px solid #f2b33d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'VT323',monospace",
                    color: '#fff',
                    fontSize: '22px',
                    boxShadow: '0 4px 12px rgba(0,0,0,.35)',
                  }}
                >
                  {i + 1}
                </div>
                {renderCard(m, i)}
              </div>
            );
          })}
        </div>

        {/* Finale */}
        <div style={{ textAlign: 'center', padding: '40px 20px 100px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-block', background: '#1c140c', border: '3px solid #3a2a17', borderRadius: '14px', padding: '30px 40px', boxShadow: '0 18px 44px rgba(0,0,0,.32)' }}>
            <div style={{ fontFamily: "'VT323',monospace", color: '#ffd34d', fontSize: '18px', letterSpacing: '5px' }}>
              {'★'} HIGH SCORE {'★'}
            </div>
            <div style={{ fontFamily: "'Anton',sans-serif", color: '#ff7a18', fontSize: 'clamp(30px,6vw,56px)', lineHeight: 1, margin: '12px 0', textShadow: '0 0 18px rgba(255,120,20,.35)' }}>
              BACHELOR{' '}UNLOCKED
            </div>
            <div style={{ fontFamily: "'Montserrat',sans-serif", color: '#e7d8b8', fontSize: '15px', maxWidth: '430px', margin: '8px auto 0', lineHeight: 1.55 }}>
              Roll complete. Congratulations on your degree, Laura {'—'} the best co-op partner a guy could ask for. Here's to the next reel. {'♥'}
            </div>
            <button type="button" onClick={replay} className="laura-btn-replay" style={{ marginTop: '24px' }}>
              {'↺'} REPLAY THE ROLL
            </button>
          </div>
        </div>
      </main>

      {/* Boot intro overlay */}
      {!open && (
        <div
          onClick={start}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#0d0a07',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,.045) 0 1px, transparent 1px 3px)',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: 'min(640px,94vw)',
              animation: closing && !reduce ? 'crtOff 0.6s cubic-bezier(.6,0,.8,1) forwards' : 'none',
            }}
          >
            {INTRO_STYLE === 'cartridge' && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-16px', position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    width: '210px',
                    height: '118px',
                    background: 'linear-gradient(#3a3f45,#23272b)',
                    borderRadius: '12px 12px 4px 4px',
                    border: '3px solid #15181b',
                    boxShadow: 'inset 0 -10px 0 rgba(0,0,0,.3)',
                    animation: reduce ? undefined : 'cartIn .85s cubic-bezier(.34,1.56,.64,1) both',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: '14px',
                  }}
                >
                  <div
                    style={{
                      width: '158px',
                      height: '52px',
                      background: 'repeating-linear-gradient(45deg,#e8772e 0 10px,#c8601f 10px 20px)',
                      borderRadius: '4px',
                      border: '2px solid #15181b',
                    }}
                  />
                </div>
              </div>
            )}

            <div
              style={{
                background: '#161009',
                border: '14px solid #2a2117',
                borderRadius: '18px',
                boxShadow: '0 0 0 4px #120d08, 0 30px 80px rgba(0,0,0,.6), inset 0 0 60px rgba(0,0,0,.7)',
                padding: '26px 26px 30px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: 'radial-gradient(120% 120% at 50% 50%, transparent 58%, rgba(0,0,0,.55) 100%)',
                }}
              />
              <div style={{ fontFamily: "'VT323',monospace", fontSize: 'clamp(15px,2.6vw,20px)', lineHeight: 1.5, color: '#FFB000', minHeight: '230px' }}>
                {lines.map((ln, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', textShadow: '0 0 8px rgba(255,176,0,.45)' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>{ln.pre}</span>
                    {ln.tag && (
                      <>
                        <span style={{ flex: 1, borderBottom: '2px dotted rgba(255,176,0,.4)', marginBottom: '6px', minWidth: '14px' }} />
                        <span style={ln.tagStyle}>{ln.tag}</span>
                      </>
                    )}
                  </div>
                ))}
                <span
                  style={{
                    display: 'inline-block',
                    width: '11px',
                    height: '20px',
                    background: '#FFB000',
                    verticalAlign: '-3px',
                    boxShadow: '0 0 10px rgba(255,176,0,.7)',
                    animation: reduce ? undefined : 'blink 1s step-end infinite',
                  }}
                />
              </div>

              {showBar && (
                <div style={{ marginTop: '18px' }}>
                  <div style={{ fontFamily: "'VT323',monospace", color: '#c77e12', fontSize: '15px', letterSpacing: '2px', marginBottom: '6px' }}>
                    LOADING LOVE{'…'}
                  </div>
                  <div style={{ height: '22px', border: '3px solid #5a4420', background: '#0d0a07', padding: '3px' }}>
                    <div
                      style={{
                        height: '100%',
                        width: barFull ? '100%' : '0',
                        background: 'repeating-linear-gradient(90deg,#FFB000 0 14px,#c77e12 14px 18px)',
                        transition: reduce ? 'none' : 'width 1.4s linear',
                        boxShadow: '0 0 12px rgba(255,176,0,.5)',
                      }}
                    />
                  </div>
                </div>
              )}

              {showStart && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '26px' }}>
                  <button type="button" onClick={start} className="laura-btn-start">
                    {'▶'} PRESS START
                  </button>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', fontFamily: "'VT323',monospace", color: '#5a4633', fontSize: '14px', letterSpacing: '2px', marginTop: '14px' }}>
              {'©'} 2025 JACOB {'×'} LAURA SYSTEMS {'—'} INSERT COIN {'♥'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
