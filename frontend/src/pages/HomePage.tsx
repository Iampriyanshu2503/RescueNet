import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getDashboardRoute } from '../utils/helpers';
import {
  ShoppingCart, Bell, Shield, BarChart3, Calendar, Users,
  CheckCircle, Leaf, Clock, Handshake, UserPlus, HeartHandshake,
  ArrowRight, ChevronDown, Sparkles, Target, TrendingUp,
} from 'lucide-react';

/* ══════════════════════════════════════════
   CANVAS PARTICLE FIELD
══════════════════════════════════════════ */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);

    interface P { x: number; y: number; vx: number; vy: number; r: number; alpha: number; da: number; }
    const particles: P[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: -Math.random() * 0.4 - 0.1,
      r: Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
      da: (Math.random() - 0.5) * 0.003,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.alpha += p.da;
        if (p.alpha <= 0.05 || p.alpha >= 0.6) p.da *= -1;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52,211,153,${p.alpha})`;
        ctx.fill();
      });

      // draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(52,211,153,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }} />;
}

/* ══════════════════════════════════════════
   MAGNETIC BUTTON
══════════════════════════════════════════ */
function MagneticBtn({ children, onClick, style }: { children: React.ReactNode; onClick: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
  };
  const handleLeave = () => { if (ref.current) ref.current.style.transform = 'translate(0,0)'; };
  return (
    <button ref={ref} onClick={onClick} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition: 'transform 0.3s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease', cursor: 'pointer', border: 'none', ...style }}>
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════
   SCROLL REVEAL WRAPPER
══════════════════════════════════════════ */
function Reveal({ children, delay = 0, direction = 'up' }: { children: React.ReactNode; delay?: number; direction?: 'up' | 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const from = direction === 'left' ? 'translateX(-40px)' : direction === 'right' ? 'translateX(40px)' : 'translateY(32px)';
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translate(0)' : from,
      transition: `opacity 0.75s ease ${delay}s, transform 0.75s cubic-bezier(0.23,1,0.32,1) ${delay}s`,
    }}>{children}</div>
  );
}

/* ══════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════ */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const dur = 2200;
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          setVal(Math.floor(ease * target));
          if (p < 1) requestAnimationFrame(tick);
          else setVal(target);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  const fmt = target >= 1_000_000
    ? (val / 1_000_000).toFixed(1) + 'M'
    : target >= 1_000
    ? (val / 1_000).toFixed(0) + 'K'
    : val.toString();
  return <span ref={ref}>{fmt}{suffix}</span>;
}

/* ══════════════════════════════════════════
   TILT CARD
══════════════════════════════════════════ */
function TiltCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
  };
  const handleLeave = () => { if (ref.current) ref.current.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)'; };
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1)', ...style }}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) navigate(getDashboardRoute(user.role));
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, []);

  // Auto-cycle feature highlight
  useEffect(() => {
    const id = setInterval(() => setActiveFeature(p => (p + 1) % 6), 2800);
    return () => clearInterval(id);
  }, []);

  const go = () => navigate('/register');
  const goLogin = () => navigate('/login');
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const features = [
    { icon: <ShoppingCart className="w-6 h-6" />, color: '#3b82f6', glow: '#3b82f680', title: 'Intuitive Listing', desc: 'Post surplus food with type, quantity, and pickup details in under 60 seconds.' },
    { icon: <Bell className="w-6 h-6" />, color: '#10b981', glow: '#10b98180', title: 'Instant Alerts', desc: 'Real-time notifications ensure food reaches recipients before it expires.' },
    { icon: <Shield className="w-6 h-6" />, color: '#8b5cf6', glow: '#8b5cf680', title: 'Safety First', desc: 'Allergen tagging, dietary flags, and compliance built into every listing.' },
    { icon: <BarChart3 className="w-6 h-6" />, color: '#f59e0b', glow: '#f59e0b80', title: 'Impact Analytics', desc: 'Track meals saved, CO₂ reduced, and community reach with live metrics.' },
    { icon: <Calendar className="w-6 h-6" />, color: '#ef4444', glow: '#ef444480', title: 'Event Integration', desc: 'Sync with campus calendars to redistribute food from large gatherings.' },
    { icon: <Users className="w-6 h-6" />, color: '#06b6d4', glow: '#06b6d480', title: 'Community Tools', desc: 'Connect students, staff, and NGOs in a zero-waste ecosystem.' },
  ];

  const steps = [
    { icon: <ShoppingCart className="w-7 h-7 text-white" />, color: '#10b981', num: '01', title: 'List', desc: 'Post surplus with type, quantity, pickup window — done in seconds.' },
    { icon: <Bell className="w-7 h-7 text-white" />, color: '#f59e0b', num: '02', title: 'Notify', desc: 'Recipients get instant push alerts and can claim food immediately.' },
    { icon: <CheckCircle className="w-7 h-7 text-white" />, color: '#3b82f6', num: '03', title: 'Pickup', desc: 'Volunteers navigate to donors with step-by-step route guidance.' },
    { icon: <BarChart3 className="w-7 h-7 text-white" />, color: '#8b5cf6', num: '04', title: 'Track', desc: 'Every rescue logged. Watch your cumulative impact grow in real time.' },
  ];

  const impactStats = [
    { icon: <ShoppingCart className="w-6 h-6 text-white" />, val: 2500000, suffix: '+', label: 'Meals Saved', sub: 'from going to waste', color: '#10b981' },
    { icon: <Leaf className="w-6 h-6 text-white" />, val: 1200, suffix: '+', label: 'Tons CO₂ Cut', sub: 'environmental impact', color: '#34d399' },
    { icon: <Clock className="w-6 h-6 text-white" />, val: 500, suffix: 'M+', label: 'Litres Saved', sub: 'water conservation', color: '#6ee7b7' },
    { icon: <Handshake className="w-6 h-6 text-white" />, val: 150, suffix: '+', label: 'Partners', sub: 'active community orgs', color: '#a7f3d0' },
  ];

  const actions = [
    { icon: <HeartHandshake className="w-7 h-7 text-white" />, color: '#10b981', shadow: '#10b98155', title: 'Donate Food', desc: 'Share surplus and make every meal count.', cta: 'Start Donating' },
    { icon: <ShoppingCart className="w-7 h-7 text-white" />, color: '#f59e0b', shadow: '#f59e0b55', title: 'Find Food', desc: 'Discover donations available near you.', cta: 'Find Food' },
    { icon: <UserPlus className="w-7 h-7 text-white" />, color: '#3b82f6', shadow: '#3b82f655', title: 'Volunteer', desc: 'Deliver food and build direct community impact.', cta: 'Become a Carrier' },
    { icon: <Handshake className="w-7 h-7 text-white" />, color: '#8b5cf6', shadow: '#8b5cf655', title: 'Partner', desc: 'Collaborate as an organisation or business.', cta: 'Learn More' },
  ];

  return (
    <div style={{ fontFamily: "'Syne', system-ui, sans-serif", background: '#060a06', color: '#fff', overflowX: 'hidden' }}>

      {/* ── CUSTOM CURSOR GLOW ── */}
      <div style={{
        position: 'fixed', width: 400, height: 400, borderRadius: '50%', pointerEvents: 'none',
        zIndex: 0, left: mousePos.x - 200, top: mousePos.y - 200,
        background: 'radial-gradient(circle, rgba(16,185,129,0.07), transparent 65%)',
        transition: 'left 0.15s ease, top 0.15s ease',
      }} />

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 200, width: 'calc(100% - 48px)', maxWidth: 1100,
        background: scrolled ? 'rgba(6,10,6,0.85)' : 'rgba(6,10,6,0.4)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${scrolled ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 16, padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.4s ease',
        boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.4)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(16,185,129,0.5)',
          }}>
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
            Byte Banquet
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden lg:flex">
          {[['Features', 'features'], ['Process', 'how-it-works'], ['Impact', 'impact']].map(([l, id]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
              padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'none'; }}
            >{l}</button>
          ))}
          <button onClick={goLogin} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', fontWeight: 500,
            padding: '8px 14px', borderRadius: 8, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >Sign In</button>
          <MagneticBtn onClick={go} style={{
            marginLeft: 4, padding: '9px 20px', borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', fontWeight: 600, fontSize: '0.875rem',
            boxShadow: '0 0 20px rgba(16,185,129,0.4)',
          }}>
            Get Started →
          </MagneticBtn>
        </nav>

        <button className="lg:hidden" onClick={go} style={{
          padding: '8px 16px', borderRadius: 8,
          background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)',
          color: '#34d399', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
        }}>Join</button>
      </header>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* BG image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url("https://cdn.builder.io/api/v1/image/assets%2F274b8ab83d5a46f8a5dcbaca899f2ff9%2F599ad064c4c84df9b8d76231e3258791?format=webp&width=800")',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.35) saturate(0.8)',
        }} />

        {/* Layered gradients */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(16,185,129,0.12), transparent)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, #060a06 100%)' }} />

        {/* Particle canvas */}
        <ParticleCanvas />

        {/* Diagonal grid lines */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, opacity: 0.04,
          backgroundImage: 'linear-gradient(rgba(52,211,153,1) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 900, margin: '0 auto', paddingTop: 80 }}>

          {/* Animated badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 100, padding: '7px 18px', marginBottom: 32,
            animation: 'fadeDown 0.8s ease both',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'blink 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.12em' }}>
              SMART FOOD REDISTRIBUTION · LIVE NOW
            </span>
          </div>

          {/* Giant headline */}
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(3.5rem, 10vw, 7rem)',
            fontWeight: 900, lineHeight: 0.95,
            letterSpacing: '-0.04em', marginBottom: 12,
            animation: 'fadeUp 0.8s ease 0.15s both',
          }}>
            <span style={{ display: 'block', color: '#fff' }}>Feed</span>
            <span style={{
              display: 'block',
              background: 'linear-gradient(90deg, #10b981 0%, #34d399 40%, #6ee7b7 70%, #10b981 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}>People.</span>
          </h1>

          {/* Subtitle with crossing-out effect */}
          <div style={{ animation: 'fadeUp 0.8s ease 0.25s both', marginBottom: 36 }}>
            <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
              Connecting surplus food from cafeterias, retailers & events
              <br />with the communities that need it —
              <strong style={{ color: '#34d399', fontWeight: 700 }}> not the bin.</strong>
            </p>
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.8s ease 0.35s both', marginBottom: 72 }}>
            <MagneticBtn onClick={go} style={{
              padding: '16px 36px', borderRadius: 14,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', fontWeight: 700, fontSize: '1rem',
              boxShadow: '0 0 40px rgba(16,185,129,0.5), 0 8px 24px rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '0.01em',
            }}>
              🌱 Start Donating <ArrowRight className="w-4 h-4" />
            </MagneticBtn>
            <MagneticBtn onClick={go} style={{
              padding: '16px 36px', borderRadius: 14,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', fontWeight: 600, fontSize: '1rem',
              backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              🔍 Find Food Nearby
            </MagneticBtn>
          </div>

          {/* Floating stat pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', animation: 'fadeUp 0.8s ease 0.45s both' }}>
            {[['15K+', 'Meals Saved', '#10b981'], ['2,500', 'Active Users', '#f59e0b'], ['80%', 'Less Waste', '#3b82f6']].map(([n, l, c]) => (
              <div key={l} style={{
                padding: '10px 20px', borderRadius: 100,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: c as string }}>{n}</span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll arrow */}
        <button onClick={() => scrollTo('features')} style={{
          position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '50%', width: 44, height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
          animation: 'bounce 2.5s ease-in-out infinite',
          zIndex: 10,
        }}>
          <ChevronDown className="w-5 h-5" />
        </button>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES — bento grid layout
      ══════════════════════════════════════════ */}
      <section id="features" style={{ padding: '120px 24px', background: '#060a06', position: 'relative' }}>
        {/* Section glow */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 72 }}>
              <div style={{
                display: 'inline-block', fontSize: '0.72rem', fontWeight: 800,
                letterSpacing: '0.18em', color: '#34d399', marginBottom: 16,
                padding: '6px 16px', borderRadius: 100,
                background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
              }}>✦ PLATFORM FEATURES</div>
              <h2 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
                fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#fff',
              }}>
                Powerful tools for<br />
                <em style={{ color: '#34d399', fontStyle: 'italic' }}>zero waste.</em>
              </h2>
            </div>
          </Reveal>

          {/* Bento grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="features-grid">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.07}>
                <TiltCard style={{ height: '100%' }}>
                  <div
                    onMouseEnter={() => setActiveFeature(i)}
                    style={{
                      background: activeFeature === i
                        ? `linear-gradient(135deg, rgba(${hexToRgb(f.color)},0.12), rgba(${hexToRgb(f.color)},0.04))`
                        : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${activeFeature === i ? f.color + '40' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: 20, padding: '28px 24px',
                      transition: 'all 0.4s ease', height: '100%',
                      cursor: 'default',
                      boxShadow: activeFeature === i ? `0 0 40px ${f.color}15` : 'none',
                    }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, background: f.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', marginBottom: 18,
                      boxShadow: activeFeature === i ? `0 8px 24px ${f.glow}` : `0 4px 12px ${f.color}40`,
                      transform: activeFeature === i ? 'scale(1.1) rotate(-4deg)' : 'scale(1)',
                      transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                    }}>{f.icon}</div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>{f.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>{f.desc}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — horizontal timeline
      ══════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '120px 24px', background: 'linear-gradient(180deg, #060a06 0%, #091409 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-5%', top: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.18em', color: '#34d399', marginBottom: 16, display: 'inline-block', padding: '6px 16px', borderRadius: 100, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                ✦ THE PROCESS
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.2rem, 5vw, 3.75rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.05 }}>
                Four steps.<br /><em style={{ color: '#34d399', fontStyle: 'italic' }}>Infinite impact.</em>
              </h2>
            </div>
          </Reveal>

          {/* Timeline */}
          <div style={{ position: 'relative' }}>
            {/* Connecting line */}
            <div style={{
              position: 'absolute', top: 52, left: '12.5%', right: '12.5%', height: 1,
              background: 'linear-gradient(90deg, transparent, #10b98140, #10b98140, transparent)',
              zIndex: 0,
            }} className="hidden lg:block" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, position: 'relative', zIndex: 1 }}>
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.12}>
                  <TiltCard>
                    <div style={{
                      textAlign: 'center', padding: '0 16px',
                    }}>
                      {/* Icon circle with pulse ring */}
                      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 28 }}>
                        <div style={{
                          position: 'absolute', inset: -8, borderRadius: '50%',
                          border: `1px solid ${s.color}30`,
                          animation: `pingRing 2s ease-in-out ${i * 0.5}s infinite`,
                        }} />
                        <div style={{
                          width: 80, height: 80, borderRadius: '50%', background: s.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: `0 0 30px ${s.color}60, 0 8px 24px ${s.color}40`,
                        }}>{s.icon}</div>
                        <div style={{
                          position: 'absolute', top: -4, right: -4, width: 26, height: 26,
                          borderRadius: '50%', background: '#060a06',
                          border: `2px solid ${s.color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 800, color: s.color,
                        }}>{s.num}</div>
                      </div>
                      <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>{s.title}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>{s.desc}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          IMPACT — full-bleed emerald
      ══════════════════════════════════════════ */}
      <section id="impact" style={{ padding: '120px 24px', position: 'relative', overflow: 'hidden', background: '#030703' }}>
        {/* Big text watermark */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          fontSize: 'clamp(8rem, 20vw, 18rem)', fontWeight: 900, color: 'rgba(16,185,129,0.03)',
          whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',
          fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1,
        }}>IMPACT</div>

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 72 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.18em', color: '#34d399', marginBottom: 16, display: 'inline-block', padding: '6px 16px', borderRadius: 100, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                ✦ BY THE NUMBERS
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.2rem, 5vw, 3.75rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.05 }}>
                Our collective<br /><em style={{ color: '#34d399', fontStyle: 'italic' }}>impact.</em>
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {impactStats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.1}>
                <TiltCard>
                  <div style={{
                    background: `linear-gradient(135deg, rgba(${hexToRgb(s.color)}, 0.1), rgba(${hexToRgb(s.color)}, 0.03))`,
                    border: `1px solid ${s.color}30`,
                    borderRadius: 24, padding: '36px 28px', textAlign: 'center',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {/* Corner glow */}
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: s.color, opacity: 0.08, filter: 'blur(20px)' }} />
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 8px 24px ${s.color}50` }}>{s.icon}</div>
                    <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#fff', lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 8 }}>
                      <Counter target={s.val} suffix={s.suffix} />
                    </div>
                    <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{s.sub}</div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div style={{
              marginTop: 28, background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: 24, padding: '40px 48px', textAlign: 'center',
            }}>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>Every Action Counts</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 520, margin: '0 auto', lineHeight: 1.85, fontSize: '0.975rem' }}>
                These numbers represent real meals reaching real families, genuine environmental protection, and communities choosing to act together.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════ */}
      <section style={{ padding: '120px 24px', background: '#060a06', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 72 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.18em', color: '#34d399', marginBottom: 16, display: 'inline-block', padding: '6px 16px', borderRadius: 100, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                ✦ JOIN THE MOVEMENT
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.2rem, 5vw, 3.75rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.05 }}>
                Be part of<br /><em style={{ color: '#34d399', fontStyle: 'italic' }}>the change.</em>
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20, marginBottom: 32 }}>
            {actions.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.08}>
                <TiltCard style={{ height: '100%' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 24, padding: '32px 24px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                    height: '100%', transition: 'all 0.3s ease',
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = a.color + '40';
                      (e.currentTarget as HTMLDivElement).style.background = `rgba(${hexToRgb(a.color)},0.06)`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)';
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
                    }}
                  >
                    <div style={{
                      width: 64, height: 64, borderRadius: 20, background: a.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                      boxShadow: `0 8px 28px ${a.shadow}`,
                    }}>{a.icon}</div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 10 }}>{a.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, marginBottom: 24, flex: 1 }}>{a.desc}</p>
                    <MagneticBtn onClick={go} style={{
                      padding: '11px 24px', borderRadius: 10, width: '100%',
                      background: a.color, color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                      boxShadow: `0 4px 16px ${a.shadow}`,
                    }}>{a.cta}</MagneticBtn>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          {/* Final mega CTA */}
          <Reveal delay={0.2}>
            <div style={{
              position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(135deg, #071a0f 0%, #0a2e1a 50%, #071a0f 100%)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 32, padding: '72px 48px', textAlign: 'center',
            }}>
              {/* Animated orb */}
              <div style={{
                position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
                width: 500, height: 300, borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(16,185,129,0.2), transparent 70%)',
                filter: 'blur(30px)', pointerEvents: 'none',
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.18em', color: '#34d399', marginBottom: 20 }}>
                  ✦ READY TO MAKE AN IMPACT?
                </p>
                <h3 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20,
                }}>
                  Join thousands rescuing<br />meals every day.
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 440, margin: '0 auto 40px', lineHeight: 1.8, fontSize: '1rem' }}>
                  Every signup is a meal rescued. Every donation is a family fed. Start today.
                </p>
                <MagneticBtn onClick={go} style={{
                  padding: '18px 48px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff', fontWeight: 800, fontSize: '1.05rem',
                  boxShadow: '0 0 50px rgba(16,185,129,0.5), 0 12px 32px rgba(0,0,0,0.4)',
                  display: 'inline-flex', alignItems: 'center', gap: 12,
                  letterSpacing: '0.01em',
                }}>
                  Get Started Today <Target className="w-5 h-5" />
                </MagneticBtn>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#030703', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '72px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 56 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(16,185,129,0.4)' }}>
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: '1.2rem' }}>Byte Banquet</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', lineHeight: 1.85, maxWidth: 300, fontSize: '0.875rem', marginBottom: 24 }}>
                Transforming campus food systems through smart redistribution technology. Feed people, not bins.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {['📧', '📞'].map(icon => (
                  <div key={icon} style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)', e.currentTarget.style.borderColor = 'rgba(52,211,153,0.3)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)', e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                  >{icon}</div>
                ))}
              </div>
            </div>
            {[
              { title: 'Platform', links: ['Features', 'How It Works', 'Impact', 'Safety Guidelines'] },
              { title: 'Community', links: ['Campus Partners', 'NGO Network', 'Success Stories', 'Resources'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontWeight: 700, color: '#fff', marginBottom: 20, fontSize: '0.875rem', letterSpacing: '0.06em' }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#34d399')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                      >{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>© 2024 Byte Banquet. All rights reserved.</p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>Feed People, Not Bins 🌱</p>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer  { from { background-position: 200% center; } to { background-position: 0% center; } }
        @keyframes blink    { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes bounce   { 0%,100% { transform:translateX(-50%) translateY(0); } 50% { transform:translateX(-50%) translateY(8px); } }
        @keyframes pingRing { 0% { transform:scale(1); opacity:0.6; } 80%,100% { transform:scale(1.5); opacity:0; } }
        .features-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 900px) { .features-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px) { .features-grid { grid-template-columns: 1fr !important; } }
        .hidden { display: none !important; }
        @media (min-width: 1024px) { .hidden.lg\\:flex { display: flex !important; } .hidden.lg\\:block { display: block !important; } }
      `}</style>
    </div>
  );
};

/* hex → "r,g,b" for rgba() */
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default HomePage;