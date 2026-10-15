/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle,
  Linkedin,
  Globe,
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  GraduationCap,
  Languages,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Sun,
  Moon
} from 'lucide-react';

// --- Configuration & Data ---

const USER_DATA = {
  name: 'ibh.lk',
  role: 'Islamic Book House · Readers’ Paradise',
  bio: 'Sri Lanka’s trusted home for Islamic books since 1968. Explore over 16,000 titles in Arabic, English, Sinhala and Tamil, along with school textbooks, stationery and more, all under one roof in Maradana, Colombo.',
  location: 'Maradana, Colombo',
  avatar: 'https://raw.githubusercontent.com/iamahamedmasry/ibh.lk-social/main/Logo.webp',
  email: 'support@ibh.lk',
  phone: '+94112684851',
  address: '77 Sri Vajiragnana Mawatha, Colombo 10'
};

// Used only if the logo cannot be read (e.g. image missing). Replace with your exact brand hex codes if you like.
const FALLBACK_PALETTE = ['#0f7a4a', '#c9a227', '#134e3a'];

const TAGS = [
  { text: 'Islamic Books', icon: <BookOpen size={13} />, tone: 0 },
  { text: 'School & Educational Books', icon: <GraduationCap size={13} />, tone: 1 },
  { text: 'Arabic · English · Sinhala · Tamil', icon: <Languages size={13} />, tone: 2 },
  { text: 'Location', icon: <MapPin size={13} />, tone: 0 }
];

const STATS = [
  { num: '1968', label: 'Established', tone: 0 },
  { num: '16K+', label: 'Book Titles', tone: 1 },
  { num: '4', label: 'Languages', tone: 2 }
];

// lucide-react has no TikTok icon, so this is a small inline SVG that matches its 24px style
const TikTokIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

interface LinkItem {
  id: string;
  label: string;
  sub: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  copyText?: string;
  tone: number;
}

const LINKS: LinkItem[] = [
  {
    id: 'website',
    label: 'Shop Online',
    sub: 'Browse the full ibh.lk collection',
    href: 'https://ibh.lk/',
    icon: <Globe size={24} />,
    tone: 0
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    sub: 'Order or ask about a title',
    href: 'https://wa.me/94757400800',
    icon: <MessageCircle size={24} />,
    badge: 'Online',
    tone: 1
  },
  {
    id: 'call',
    label: 'Call the Store',
    sub: '+94 11 268 4851',
    href: 'tel:+94112684851',
    icon: <Phone size={24} />,
    tone: 2
  },
  {
    id: 'visit',
    label: 'Visit Us',
    sub: '77 Sri Vajiragnana Mawatha, Colombo 10',
    href: 'https://www.google.com/maps/search/?api=1&query=IBH+Readers+Paradise+77+Sri+Vajiragnana+Mawatha+Colombo',
    icon: <MapPin size={24} />,
    tone: 0
  },
  {
    id: 'instagram',
    label: 'Instagram',
    sub: 'New arrivals & book snapshots',
    href: 'https://www.instagram.com/ibh.lk/',
    icon: <Instagram size={24} />,
    tone: 1
  },
  {
    id: 'facebook',
    label: 'Facebook',
    sub: 'Updates, offers & community',
    href: 'https://www.facebook.com/Ibh.lk/',
    icon: <Facebook size={24} />,
    tone: 2
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    sub: '@ibh.lk · Book picks & short clips',
    href: 'https://www.tiktok.com/@ibh.lk',
    icon: <TikTokIcon size={24} />,
    tone: 0
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    sub: 'Company page',
    href: 'https://www.linkedin.com/company/ibh-readers-paradise/',
    icon: <Linkedin size={24} />,
    tone: 2
  },
  {
    id: 'email',
    label: 'Email',
    sub: 'support@ibh.lk',
    href: 'mailto:support@ibh.lk',
    icon: <Mail size={24} />,
    copyText: 'support@ibh.lk',
    tone: 0
  }
];

// --- Color helpers (palette is pulled from the logo at runtime) ---

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const rgba = (hex: string, a: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return { h, s, l };
};

/** Reads the logo and returns up to 3 distinct, vivid dominant colors. */
const extractPalette = (src: string): Promise<string[]> =>
  new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve(FALLBACK_PALETTE);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        const buckets = new Map<string, { r: number; g: number; b: number; n: number; score: number }>();
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 200) continue;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const { s, l } = rgbToHsl(r, g, b);
          if (s < 0.25 || l < 0.12 || l > 0.9) continue; // skip white, black, grey
          const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
          const e = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0, score: 0 };
          e.r += r; e.g += g; e.b += b; e.n += 1; e.score += 1 + s;
          buckets.set(key, e);
        }

        const sorted = [...buckets.values()]
          .sort((a, b) => b.score - a.score)
          .map(e => ({ r: e.r / e.n, g: e.g / e.n, b: e.b / e.n }));

        const picked: { r: number; g: number; b: number }[] = [];
        for (const c of sorted) {
          const far = picked.every(p => {
            const hp = rgbToHsl(p.r, p.g, p.b).h;
            const hc = rgbToHsl(c.r, c.g, c.b).h;
            const diff = Math.min(Math.abs(hp - hc), 360 - Math.abs(hp - hc));
            return diff > 25;
          });
          if (far) picked.push(c);
          if (picked.length === 3) break;
        }

        if (picked.length === 0) return resolve(FALLBACK_PALETTE);
        const hexes = picked.map(c => toHex(c.r, c.g, c.b));
        while (hexes.length < 3) hexes.push(FALLBACK_PALETTE[hexes.length]);
        resolve(hexes);
      } catch {
        resolve(FALLBACK_PALETTE);
      }
    };
    img.onerror = () => resolve(FALLBACK_PALETTE);
    img.src = src;
  });

// --- Styles ---

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Space+Grotesk:wght@700&display=swap');

  :root {
    --transition-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --font-heading: 'Space Grotesk', sans-serif;
    --font-body: 'DM Sans', sans-serif;
  }

  .light {
    --bg-main: #fbf8f1;
    --text-main: #1b2a22;
    --text-dim: #5b6b62;
    --glass-bg: rgba(255, 255, 255, 0.75);
    --glass-border: rgba(27, 42, 34, 0.1);
    --orb-opacity: 0.18;
    --texture-rgb: 27, 42, 34;
    --texture-opacity: 0.045;
  }

  .dark {
    --bg-main: #08120d;
    --text-main: #f7f4ea;
    --text-dim: rgba(247, 244, 234, 0.62);
    --glass-bg: rgba(255, 255, 255, 0.04);
    --glass-border: rgba(255, 255, 255, 0.09);
    --orb-opacity: 0.35;
    --texture-rgb: 255, 255, 255;
    --texture-opacity: 0.025;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

  body {
    background-color: var(--bg-main);
    color: var(--text-main);
    font-family: var(--font-body);
    overflow-x: hidden;
    min-height: 100vh;
    transition: background-color 0.5s ease, color 0.5s ease;
  }

  .app-container {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4rem 1.5rem;
    z-index: 1;
  }

  .theme-toggle {
    position: fixed; top: 1.5rem; right: 1.5rem;
    width: 48px; height: 48px; border-radius: 16px;
    background: var(--glass-bg); border: 1px solid var(--glass-border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; z-index: 100;
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    transition: all 0.3s var(--transition-spring);
    color: var(--text-main);
  }
  .theme-toggle:hover { transform: scale(1.1) rotate(12deg); border-color: var(--brand); }

  .bg-canvas { position: fixed; inset: 0; z-index: -3; pointer-events: none; }

  .bg-texture {
    position: fixed; inset: 0; z-index: -2; pointer-events: none;
    background-image:
      linear-gradient(rgba(var(--texture-rgb), var(--texture-opacity)) 1px, transparent 1px),
      linear-gradient(90deg, rgba(var(--texture-rgb), var(--texture-opacity)) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .parallax-orb {
    position: fixed; border-radius: 50%; filter: blur(80px);
    z-index: -4; opacity: var(--orb-opacity); pointer-events: none;
    transition: opacity 0.5s ease, background 0.6s ease;
  }

  /* --- Profile --- */
  .profile-section {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; margin-bottom: 3rem; max-width: 600px;
  }

  .avatar-wrapper { position: relative; width: 160px; height: 160px; margin-bottom: 2rem; }

  .avatar-ring {
    position: absolute; inset: -10px; border-radius: 50%;
    background: conic-gradient(from 0deg, var(--brand), var(--brand2), var(--brand3), var(--brand));
    animation: spin 4s linear infinite;
    mask: radial-gradient(transparent 64%, black 65%);
    -webkit-mask: radial-gradient(transparent 64%, black 65%);
  }

  .avatar-img {
    width: 100%; height: 100%; border-radius: 50%; object-fit: contain;
    background: #fff;
    border: 6px solid var(--bg-main);
    position: relative; z-index: 2;
    transition: border-color 0.5s ease;
  }

  .status-dot {
    position: absolute; bottom: 12px; right: 12px;
    width: 20px; height: 20px; background-color: #4ade80;
    border-radius: 50%; border: 4px solid var(--bg-main);
    z-index: 3; animation: pulse 2s infinite;
  }

  .profile-name {
    font-family: var(--font-heading);
    font-size: 3.5rem; margin-bottom: 0.5rem;
    background: linear-gradient(to right, var(--brand), var(--brand2), var(--brand3));
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.04em; min-height: 4.2rem;
    display: flex; align-items: center; justify-content: center;
  }

  .cursor {
    display: inline-block; width: 4px; height: 3rem;
    background-color: var(--brand); margin-left: 4px;
    animation: blink 1s step-end infinite;
  }

  @keyframes blink { from, to { opacity: 1; } 50% { opacity: 0; } }

  .profile-role { font-size: 1.2rem; color: var(--brand2); margin-bottom: 1rem; font-weight: 700; }

  .profile-bio {
    font-size: 1rem; line-height: 1.7; color: var(--text-dim);
    margin-bottom: 1.5rem; padding: 0 1rem;
  }

  .tags-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; }

  .tag-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 0.5rem 1.1rem; border-radius: 100px;
    font-size: 0.85rem; font-weight: 600;
    background: var(--glass-bg); border: 1px solid var(--glass-border);
    transition: all 0.3s ease; cursor: default;
  }

  /* --- Stats --- */
  .stats-bar {
    display: grid; grid-template-columns: repeat(3, 1fr);
    width: 100%; max-width: 500px;
    background: var(--glass-bg);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 28px; padding: 1.5rem; margin-bottom: 3rem;
  }

  .stat-item { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }

  .stat-num {
    font-family: var(--font-heading); font-size: 1.75rem;
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .stat-label {
    font-size: 0.72rem; text-transform: uppercase;
    letter-spacing: 0.12em; color: var(--text-dim); text-align: center;
  }

  /* --- Links --- */
  .links-container { width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: 1.25rem; }

  .link-card {
    position: relative; width: 100%;
    background: var(--glass-bg); border: 1px solid var(--glass-border);
    border-radius: 24px; padding: 1.5rem;
    display: flex; align-items: center; gap: 1.5rem;
    text-decoration: none; color: var(--text-main);
    overflow: hidden;
    transition: transform 0.1s linear, border-color 0.3s ease, background-color 0.3s ease;
    transform-style: preserve-3d; perspective: 1000px;
    opacity: 0; transform: translateY(20px);
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  }

  .link-card.visible {
    opacity: 1; transform: translateY(0);
    transition: opacity 0.6s ease, transform 0.6s var(--transition-spring);
  }

  .link-card:hover {
    border-color: var(--border);
    box-shadow: 0 0 0 1px var(--border), 0 10px 30px -10px var(--shadow), 0 0 20px var(--shadow);
  }

  .link-card::before {
    content: ''; position: absolute; inset: 0;
    background: var(--wash); opacity: 0;
    transition: opacity 0.3s ease; z-index: 0;
  }
  .link-card:hover::before { opacity: 1; }

  .shimmer-sweep {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
    transform: translateX(-120%); transition: transform 0.6s ease;
    pointer-events: none; z-index: 1;
  }
  .link-card:hover .shimmer-sweep { transform: translateX(120%); }

  .icon-box {
    position: relative; width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    background: var(--wash); color: var(--glow);
    z-index: 2; transition: transform 0.4s var(--transition-spring);
  }
  .link-card:hover .icon-box { transform: scale(1.15) rotate(-9deg); filter: drop-shadow(0 0 8px var(--glow)); }

  .link-info { flex: 1; z-index: 2; min-width: 0; }

  .link-label {
    font-family: var(--font-heading); font-size: 1.1rem;
    margin-bottom: 0.15rem; display: flex; align-items: center; gap: 0.5rem;
  }

  .link-sub { font-size: 0.85rem; color: var(--text-dim); }

  .link-arrow { z-index: 2; color: var(--text-dim); transition: transform 0.4s var(--transition-spring), color 0.3s ease; }
  .link-card:hover .link-arrow { transform: translateX(5px); color: var(--text-main); }

  .badge {
    padding: 0.2rem 0.5rem; border-radius: 6px;
    font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
    background: #4ade80; color: #000;
    display: flex; align-items: center; gap: 0.25rem;
  }
  .badge-dot { width: 6px; height: 6px; background: #000; border-radius: 50%; animation: pulse 1.5s infinite; }

  .footer-note {
    margin-top: 2.5rem; font-size: 0.8rem; color: var(--text-dim);
    text-align: center; line-height: 1.6;
  }

  /* --- Skeleton --- */
  .skeleton {
    background: linear-gradient(90deg, rgba(128,128,128,0.08) 25%, rgba(128,128,128,0.16) 50%, rgba(128,128,128,0.08) 75%);
    background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 10px;
  }

  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  @keyframes drawPath { to { stroke-dashoffset: 0; } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
  @keyframes toastIn { from { transform: translateY(100%) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

  .toast {
    position: fixed; bottom: 2rem;
    background: var(--brand); color: #fff;
    padding: 0.75rem 1.5rem; border-radius: 100px; font-weight: 600;
    display: flex; align-items: center; gap: 0.5rem;
    box-shadow: 0 10px 30px var(--shadow-brand);
    z-index: 1000; animation: toastIn 0.4s var(--transition-spring);
  }

  @media (max-width: 480px) {
    .profile-name { font-size: 2.4rem; }
    .stats-bar { padding: 1rem; border-radius: 20px; }
    .link-card { padding: 1rem; gap: 1rem; }
    .icon-box { width: 44px; height: 44px; border-radius: 12px; }
    .link-label { font-size: 1rem; }
    .link-sub { font-size: 0.75rem; }
  }

  @media (max-width: 400px) { .badge { display: none; } }
`;

// --- Components ---

const BgCanvas = () => {
  const paths = [
    { d: 'M-100,200 C150,50 450,450 700,200 S1150,-50 1400,200', gradient: 'url(#grad1)', delay: '0s', duration: '12s' },
    { d: 'M1400,800 C1150,950 850,550 600,800 S150,1050 -100,800', gradient: 'url(#grad2)', delay: '2s', duration: '15s' },
    { d: 'M-100,500 C200,300 500,700 800,500 S1200,300 1500,500', gradient: 'url(#grad3)', delay: '4s', duration: '10s' },
    { d: 'M200,-100 C400,150 0,450 200,700 S400,1150 200,1400', gradient: 'url(#grad1)', delay: '1s', duration: '18s' },
    { d: 'M1000,-100 C800,150 1200,450 1000,700 S800,1150 1000,1400', gradient: 'url(#grad2)', delay: '5s', duration: '14s' }
  ];

  return (
    <div className="bg-canvas">
      <svg width="100%" height="100%" viewBox="0 0 1300 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--brand)" />
            <stop offset="50%" stopColor="var(--brand2)" />
            <stop offset="100%" stopColor="var(--brand3)" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--brand3)" />
            <stop offset="100%" stopColor="var(--brand)" />
          </linearGradient>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--brand2)" />
            <stop offset="100%" stopColor="var(--brand3)" />
          </linearGradient>
        </defs>
        {paths.map((p, i) => (
          <g key={i} style={{ animation: `float ${p.duration} ease-in-out infinite alternate` }}>
            <path
              d={p.d}
              fill="none"
              stroke={p.gradient}
              strokeWidth="2"
              strokeDasharray="2000"
              strokeDashoffset="2000"
              style={{ animation: `drawPath 4s ease-out forwards ${p.delay}`, opacity: 0.3 }}
            />
            {[0.2, 0.5, 0.8].map((pos, j) => (
              <circle
                key={j}
                r="3"
                fill="var(--brand2)"
                style={{
                  offsetPath: `path("${p.d}")`,
                  offsetDistance: `${pos * 100}%`,
                  animation: 'pulse 3s infinite alternate'
                } as React.CSSProperties}
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
};

const Typewriter = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayText(text.substring(0, i));
      i++;
      if (i > text.length) {
        clearInterval(timer);
        setIsDone(true);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <h1 className="profile-name">
      {displayText}
      {!isDone && <span className="cursor" />}
    </h1>
  );
};

const Skeleton = () => (
  <div className="app-container light" style={{ opacity: 0.6 }}>
    <div className="profile-section">
      <div className="avatar-wrapper">
        <div className="skeleton" style={{ width: '160px', height: '160px', borderRadius: '50%' }} />
      </div>
      <div className="skeleton" style={{ width: '300px', height: '60px', marginBottom: '1rem' }} />
      <div className="skeleton" style={{ width: '200px', height: '24px', marginBottom: '1rem' }} />
      <div className="skeleton" style={{ width: '90%', height: '80px', marginBottom: '2rem' }} />
      <div className="tags-container">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton" style={{ width: '100px', height: '40px', borderRadius: '100px' }} />
        ))}
      </div>
    </div>
    <div className="stats-bar skeleton" style={{ height: '100px' }} />
    <div className="links-container">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
        <div key={i} className="skeleton" style={{ width: '100%', height: '100px', borderRadius: '24px' }} />
      ))}
    </div>
  </div>
);

interface LinkCardProps {
  link: LinkItem;
  palette: string[];
  onCopy: (text: string) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, palette, onCopy }) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const tone = palette[link.tone % palette.length];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -7;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 7;
    requestAnimationFrame(() => {
      card.style.transform = `translateY(-5px) scale(1.024) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    requestAnimationFrame(() => {
      if (cardRef.current) cardRef.current.style.transform = 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)';
    });
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (link.copyText) {
      e.preventDefault();
      onCopy(link.copyText);
    }
    if (cardRef.current) {
      cardRef.current.style.transform = 'scale(0.97)';
      setTimeout(() => {
        if (cardRef.current) cardRef.current.style.transform = 'translateY(-5px) scale(1.024)';
      }, 100);
    }
  };

  const external = !link.copyText && !link.href.startsWith('tel:') && !link.href.startsWith('mailto:');

  return (
    <a
      ref={cardRef}
      href={link.href}
      target={external ? '_blank' : undefined}
      rel="noopener noreferrer"
      className={`link-card ${isVisible ? 'visible' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={
        {
          '--wash': rgba(tone, 0.12),
          '--border': rgba(tone, 0.45),
          '--shadow': rgba(tone, 0.25),
          '--glow': tone
        } as React.CSSProperties
      }
    >
      <div className="shimmer-sweep" />
      <div className="icon-box">{link.icon}</div>
      <div className="link-info">
        <div className="link-label">
          {link.label}
          {link.badge && (
            <span className="badge">
              <span className="badge-dot" />
              {link.badge}
            </span>
          )}
        </div>
        <div className="link-sub">{link.sub}</div>
      </div>
      <div className="link-arrow">{link.copyText ? <ExternalLink size={20} /> : <ArrowRight size={20} />}</div>
    </a>
  );
};

// --- Main App ---

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [palette, setPalette] = useState<string[]>(FALLBACK_PALETTE);

  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Pull brand colors straight from the logo file
  useEffect(() => {
    let cancelled = false;
    extractPalette(USER_DATA.avatar).then(p => {
      if (!cancelled) setPalette(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      if ('fonts' in document) await document.fonts.ready;
      setTimeout(() => requestAnimationFrame(() => setIsLoaded(true)), 1200);
    };
    init();

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      requestAnimationFrame(() => {
        if (orb1Ref.current) orb1Ref.current.style.transform = `translate(${(x - 0.5) * 60}px, ${(y - 0.5) * 60}px)`;
        if (orb2Ref.current) orb2Ref.current.style.transform = `translate(${(x - 0.5) * -40}px, ${(y - 0.5) * -40}px)`;
        if (orb3Ref.current) orb3Ref.current.style.transform = `translate(${(x - 0.5) * 20}px, ${(y - 0.5) * 20}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard?.writeText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const [c1, c2, c3] = palette;
  const themeVars = {
    '--brand': c1,
    '--brand2': c2,
    '--brand3': c3,
    '--shadow-brand': rgba(c1, 0.35)
  } as React.CSSProperties;

  if (!isLoaded) {
    return (
      <>
        <style>{STYLES}</style>
        <Skeleton />
      </>
    );
  }

  return (
    <div className={theme} style={themeVars}>
      <style>{STYLES}</style>

      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
      </button>

      <BgCanvas />
      <div className="bg-texture" />

      <div ref={orb1Ref} className="parallax-orb" style={{ width: 400, height: 400, background: c1, top: -100, left: -100 }} />
      <div ref={orb2Ref} className="parallax-orb" style={{ width: 500, height: 500, background: c2, bottom: -150, right: -150 }} />
      <div ref={orb3Ref} className="parallax-orb" style={{ width: 300, height: 300, background: c3, top: '40%', left: '50%', marginLeft: -150 }} />

      <main className="app-container">
        <section className="profile-section">
          <div className="avatar-wrapper">
            <div className="avatar-ring" />
            <img
              src={USER_DATA.avatar}
              alt="Islamic Book House logo"
              className="avatar-img"
              referrerPolicy="no-referrer"
            />
            <div className="status-dot" />
          </div>

          <Typewriter text={USER_DATA.name} />
          <p className="profile-role">{USER_DATA.role}</p>
          <p className="profile-bio">{USER_DATA.bio}</p>

          <div className="tags-container">
            {TAGS.map((tag, i) => {
              const color = palette[tag.tone % palette.length];
              return (
                <span
                  key={i}
                  className="tag-pill"
                  style={{ color, borderColor: rgba(color, 0.35) }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = color;
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '';
                    e.currentTarget.style.color = color;
                  }}
                >
                  {tag.icon}
                  {tag.text === 'Location' ? USER_DATA.location : tag.text}
                </span>
              );
            })}
          </div>
        </section>

        <section className="stats-bar">
          {STATS.map((stat, i) => {
            const color = palette[stat.tone % palette.length];
            const next = palette[(stat.tone + 1) % palette.length];
            return (
              <div key={i} className="stat-item">
                <span className="stat-num" style={{ backgroundImage: `linear-gradient(135deg, ${color}, ${next})` }}>
                  {stat.num}
                </span>
                <span className="stat-label">{stat.label}</span>
              </div>
            );
          })}
        </section>

        <section className="links-container">
          {LINKS.map(link => (
            <LinkCard key={link.id} link={link} palette={palette} onCopy={handleCopy} />
          ))}
        </section>

        <p className="footer-note">
          Islamic books · School textbooks · Stationery · Gifts
          <br />
          © {new Date().getFullYear()} Islamic Book House (IBH) · {USER_DATA.address}
        </p>
      </main>

      {showToast && (
        <div className="toast">
          <CheckCircle2 size={18} />
          Email copied to clipboard!
        </div>
      )}
    </div>
  );
}
