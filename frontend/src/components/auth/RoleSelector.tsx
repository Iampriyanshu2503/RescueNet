import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Heart, Link2, Truck, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Role = 'donor' | 'recipient' | 'volunteer';

/* ══════════════════════════════════════
   FLOATING PARTICLE CANVAS
══════════════════════════════════════ */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    let W = (canvas.width = canvas.offsetWidth);
    let H = (canvas.height = canvas.offsetHeight);

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);

    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25, vy: -Math.random() * 0.3 - 0.05,
      r: Math.random() * 2 + 0.4,
      a: Math.random() * 0.4 + 0.08, da: (Math.random() - 0.5) * 0.004,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy; p.a += p.da;
        if (p.a < 0.05 || p.a > 0.5) p.da *= -1;
        if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
        if (p.x < -6) p.x = W + 6;
        if (p.x > W + 6) p.x = -6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52,211,153,${p.a})`;
        ctx.fill();
      }
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(52,211,153,${0.07 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

/* ══════════════════════════════════════
   ROLE DATA
══════════════════════════════════════ */
const ROLES = [
  {
    id: 'donor' as Role, route: '/donor-register',
    label: 'Donor', sub: 'Give surplus a second life',
    desc: 'Share your surplus food with those who need it most and turn waste into nourishment.',
    features: ['List surplus food instantly', 'Track all donations', 'View impact analytics', 'Manage pickups'],
    Icon: Heart,
    grad: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    glow: 'rgba(244,63,94,0.45)',
    glowSoft: 'rgba(244,63,94,0.12)',
    accent: '#f43f5e',
    accentLight: '#fda4af',
    ring: 'rgba(244,63,94,0.35)',
    particle: '#f43f5e',
  },
  {
    id: 'recipient' as Role, route: '/recipient-register',
    label: 'Recipient', sub: 'Find food near you',
    desc: 'Discover available donations in your community and request what your organisation needs.',
    features: ['Browse food listings', 'Request donations', 'Track pickup history', 'Search by location'],
    Icon: Link2,
    grad: 'linear-gradient(135deg, #10b981 0%, #0891b2 100%)',
    glow: 'rgba(16,185,129,0.45)',
    glowSoft: 'rgba(16,185,129,0.12)',
    accent: '#10b981',
    accentLight: '#6ee7b7',
    ring: 'rgba(16,185,129,0.35)',
    particle: '#10b981',
  },
  {
    id: 'volunteer' as Role, route: '/volunteer-register',
    label: 'Volunteer', sub: 'Be the bridge',
    desc: 'Deliver food from donors to recipients and become the backbone of our community.',
    features: ['Accept delivery tasks', 'Coordinate pickups', 'Track deliveries', 'Build community impact'],
    Icon: Truck,
    grad: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    glow: 'rgba(139,92,246,0.45)',
    glowSoft: 'rgba(139,92,246,0.12)',
    accent: '#8b5cf6',
    accentLight: '#c4b5fd',
    ring: 'rgba(139,92,246,0.35)',
    particle: '#8b5cf6',
  },
];

/* ══════════════════════════════════════
   MAIN
══════════════════════════════════════ */
export default function FoodBanquetSelection() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role | null>(null);
  const [hovered, setHovered] = useState<Role | null>(null);
  const [mounted, setMounted] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleSelect = (role: Role, route: string) => {
    setSelected(role);
    setTimeout(() => navigate(route), 380);
  };

  /* 3D tilt */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const el = cardRefs.current[idx];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-8px) scale(1.02)`;
  };
  const handleMouseLeave = (idx: number) => {
    const el = cardRefs.current[idx];
    if (el) el.style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateY(0) scale(1)';
  };

  const active = hovered || selected;

  return (
    <div style={{
      minHeight: '100vh', position: 'relative', overflow: 'hidden',
      background: '#07090f',
      fontFamily: "'Syne', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 20px',
    }}>

      {/* ── BACKGROUND LAYERS ── */}
      <ParticleCanvas />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.025,
        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* Dynamic colour blob that follows hovered card */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 700, height: 700, borderRadius: '50%', pointerEvents: 'none', zIndex: 1,
        background: active
          ? `radial-gradient(circle, ${ROLES.find(r => r.id === active)?.glowSoft ?? 'rgba(16,185,129,0.08)'}, transparent 65%)`
          : 'radial-gradient(circle, rgba(16,185,129,0.06), transparent 65%)',
        filter: 'blur(40px)',
        transition: 'background 0.6s ease',
      }} />

      {/* ── BACK BUTTON ── */}
      <button onClick={() => navigate('/login')} style={{
        position: 'absolute', top: 24, left: 24, zIndex: 30,
        width: 42, height: 42, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* ── CONTENT ── */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 1080 }}>

        {/* Header */}
        <div style={{
          textAlign: 'center', marginBottom: 56,
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.7s cubic-bezier(0.23,1,0.32,1)',
        }}>
          {/* Animated logo */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 20, marginBottom: 24,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: '0 0 40px rgba(16,185,129,0.5), 0 12px 32px rgba(0,0,0,0.4)',
            animation: 'float 3s ease-in-out infinite',
          }}>
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>

          {/* Live badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 100, padding: '5px 14px', marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.12em' }}>
              JOIN THE MOVEMENT · RESCUENET
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05,
            color: '#fff', marginBottom: 14,
          }}>
            Join{' '}
            <span style={{
              background: 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7, #10b981)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}>
              Food Banquet
            </span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', maxWidth: 380, margin: '0 auto', lineHeight: 1.7 }}>
            Choose your role in the mission to end food waste
          </p>
        </div>

        {/* ── CARDS ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20, marginBottom: 40,
        }} className="role-grid">
          {ROLES.map((role, i) => {
            const isSel = selected === role.id;
            const isHov = hovered === role.id;
            const isDim = active && active !== role.id;

            return (
              <div
                key={role.id}
                ref={el => { cardRefs.current[i] = el; }}
                onClick={() => handleSelect(role.id, role.route)}
                onMouseEnter={() => setHovered(role.id)}
                onMouseLeave={() => { setHovered(null); handleMouseLeave(i); }}
                onMouseMove={e => handleMouseMove(e, i)}
                style={{
                  position: 'relative', overflow: 'hidden',
                  borderRadius: 24, padding: '32px 28px',
                  cursor: 'pointer', userSelect: 'none',
                  background: isHov || isSel
                    ? `linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))`
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isHov || isSel ? role.ring : 'rgba(255,255,255,0.06)'}`,
                  opacity: isDim ? 0.38 : 1,
                  transition: 'opacity 0.3s ease, border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease, transform 0.4s cubic-bezier(0.23,1,0.32,1)',
                  boxShadow: isSel
                    ? `0 0 60px ${role.glow}, 0 20px 50px rgba(0,0,0,0.5)`
                    : isHov
                    ? `0 0 40px ${role.glowSoft}, 0 12px 32px rgba(0,0,0,0.4)`
                    : '0 2px 12px rgba(0,0,0,0.3)',
                  animation: `fadeUp 0.6s ease ${0.1 + i * 0.12}s both`,
                }}
              >
                {/* Shimmer top line */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: role.grad,
                  opacity: isHov || isSel ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  borderRadius: '24px 24px 0 0',
                }} />

                {/* Corner glow */}
                <div style={{
                  position: 'absolute', top: -40, right: -40,
                  width: 120, height: 120, borderRadius: '50%',
                  background: role.accent,
                  opacity: isHov || isSel ? 0.12 : 0,
                  filter: 'blur(30px)',
                  transition: 'opacity 0.4s ease',
                  pointerEvents: 'none',
                }} />

                {/* Number badge */}
                <div style={{
                  position: 'absolute', top: 18, right: 20,
                  fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em',
                  color: isHov || isSel ? role.accentLight : 'rgba(255,255,255,0.12)',
                  transition: 'color 0.3s ease',
                }}>0{i + 1}</div>

                {/* Icon */}
                <div style={{
                  width: 60, height: 60, borderRadius: 18,
                  background: role.grad, marginBottom: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isHov || isSel
                    ? `0 0 30px ${role.glow}, 0 8px 20px ${role.glowSoft}`
                    : `0 6px 18px ${role.glowSoft}`,
                  transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: isHov || isSel ? 'scale(1.15) rotate(-6deg)' : 'scale(1) rotate(0deg)',
                }}>
                  <role.Icon className="w-7 h-7 text-white" />
                </div>

                {/* Text */}
                <h3 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.35rem', fontWeight: 700,
                  color: '#fff', marginBottom: 4, letterSpacing: '-0.01em',
                }}>{role.label}</h3>

                <p style={{
                  fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: role.accentLight,
                  marginBottom: 14, opacity: isHov || isSel ? 1 : 0.6,
                  transition: 'opacity 0.3s',
                }}>{role.sub}</p>

                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: 20 }}>
                  {role.desc}
                </p>

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                  {role.features.map((f, fi) => (
                    <li key={f} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)',
                      marginBottom: 8,
                      opacity: isHov || isSel ? 1 : 0.7,
                      transform: isHov || isSel ? 'translateX(4px)' : 'translateX(0)',
                      transition: `all 0.3s ease ${fi * 0.04}s`,
                    }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: role.grad, flexShrink: 0,
                        boxShadow: isHov || isSel ? `0 0 6px ${role.accent}` : 'none',
                        transition: 'box-shadow 0.3s',
                      }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA row */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{
                    fontSize: '0.85rem', fontWeight: 700,
                    color: isHov || isSel ? role.accentLight : 'rgba(255,255,255,0.3)',
                    transition: 'color 0.3s',
                  }}>
                    {isSel ? 'Opening...' : `Register as ${role.label}`}
                  </span>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: isHov || isSel ? role.grad : 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: isHov || isSel ? 'translateX(4px) rotate(-45deg)' : 'none',
                    boxShadow: isHov || isSel ? `0 4px 14px ${role.glowSoft}` : 'none',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.7s ease 0.5s',
        }}>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.25)' }}>
            Start your journey in building a community where no food goes to waste
            <span style={{ margin: '0 12px', color: 'rgba(255,255,255,0.1)' }}>·</span>
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: 700, color: '#34d399',
              fontSize: '0.85rem', padding: 0,
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#6ee7b7')}
              onMouseLeave={e => (e.currentTarget.style.color = '#34d399')}
            >Sign In</button>
          </p>
        </div>
      </div>

      {/* Help button */}
      <button style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 50,
        width: 48, height: 48, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
        transition: 'all 0.2s',
        backdropFilter: 'blur(10px)',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float    { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes shimmer  { from { background-position:200% center; } to { background-position:0% center; } }
        @keyframes blink    { 0%,100% { opacity:1; } 50% { opacity:0.25; } }
        .role-grid { grid-template-columns: repeat(3,1fr); }
        @media (max-width: 860px)  { .role-grid { grid-template-columns: 1fr !important; max-width: 440px; margin: 0 auto 40px; } }
        @media (max-width: 1100px) and (min-width: 861px) { .role-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </div>
  );
}