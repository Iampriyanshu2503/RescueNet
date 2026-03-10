import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Leaf, ArrowRight, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../store/authSlice';
import { getDashboardRoute } from '../utils/helpers';
import { showNotification } from '../utils/notificationUtils';

/* ══════════════════════════════════════════
   PARTICLE CANVAS — mouse repel + food emojis
══════════════════════════════════════════ */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -999, y: -999 });
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener('resize', resize);
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    canvas.addEventListener('mousemove', onMove);
    const FOOD = ['🍱','🥗','🍎','🥦','🍞','🥕','🫐','🍋'];
    const pts = Array.from({ length: 55 }, (_, i) => ({
      x: Math.random() * 800, y: Math.random() * 700,
      vx: (Math.random() - 0.5) * 0.42, vy: (Math.random() - 0.5) * 0.42,
      r: Math.random() * 2 + 0.8,
      emoji: i < 10 ? FOOD[i % FOOD.length] : null,
      emojiSize: 12 + Math.random() * 9,
      opacity: 0.14 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
    }));
    let t = 0;
    const draw = () => {
      t += 0.009; ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        const dx = p.x - mouse.current.x, dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 85) { p.vx += (dx/dist)*0.28; p.vy += (dy/dist)*0.28; }
        p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > canvas.width) { p.x = canvas.width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > canvas.height) { p.y = canvas.height; p.vy *= -1; }
        const pulse = Math.sin(t * 2 + p.phase) * 0.5 + 0.5;
        if (p.emoji) {
          ctx.save(); ctx.globalAlpha = p.opacity * (0.6 + pulse * 0.4);
          ctx.font = `${p.emojiSize}px sans-serif`; ctx.fillText(p.emoji, p.x, p.y); ctx.restore();
        } else {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r*(0.8+pulse*0.4), 0, Math.PI*2);
          ctx.fillStyle = `rgba(52,168,83,${0.3+pulse*0.2})`; ctx.fill();
        }
      });
      for (let i = 0; i < pts.length; i++) {
        if (pts[i].emoji) continue;
        for (let j = i+1; j < pts.length; j++) {
          if (pts[j].emoji) continue;
          const dx = pts[i].x-pts[j].x, dy = pts[i].y-pts[j].y;
          const d = Math.sqrt(dx*dx+dy*dy);
          if (d < 90) {
            ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
            ctx.strokeStyle = `rgba(52,168,83,${0.12*(1-d/90)})`; ctx.lineWidth=0.6; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); canvas.removeEventListener('mousemove', onMove); };
  }, []);
  return <canvas ref={ref} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />;
}

/* ══════════════════════════════════════════
   TYPEWRITER
══════════════════════════════════════════ */
function Typewriter({ phrases }: { phrases: string[] }) {
  const [text, setText] = useState('');
  const [pi, setPi] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);
  useEffect(() => { const id = setInterval(() => setBlink(b => !b), 530); return () => clearInterval(id); }, []);
  useEffect(() => {
    const full = phrases[pi];
    const id = setTimeout(() => {
      if (!deleting) {
        if (text.length < full.length) setText(full.slice(0, text.length + 1));
        else setTimeout(() => setDeleting(true), 1900);
      } else {
        if (text.length > 0) setText(text.slice(0, -1));
        else { setDeleting(false); setPi((pi + 1) % phrases.length); }
      }
    }, deleting ? 42 : 88);
    return () => clearTimeout(id);
  }, [text, deleting, pi, phrases]);
  return (
    <span>
      <span style={{ background:'linear-gradient(90deg,#6ee7b7,#34d399,#a7f3d0,#6ee7b7)', backgroundSize:'250% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'gradMove 3s ease infinite' }}>{text}</span>
      <span style={{ opacity: blink ? 1 : 0, color:'#34d399', WebkitTextFillColor:'#34d399', transition:'opacity 0.1s' }}>|</span>
    </span>
  );
}

/* ══════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════ */
function Counter({ to, suffix='' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let s = 0; const step = to / 55;
      const id = setInterval(() => { s = Math.min(s+step, to); setVal(Math.round(s)); if (s >= to) clearInterval(id); }, 22);
      obs.disconnect();
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ══════════════════════════════════════════
   CONFETTI BURST on success
══════════════════════════════════════════ */
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const items = Array.from({ length: 24 }, (_, i) => ({
    angle: (i / 24) * 360,
    dist: 50 + Math.random() * 80,
    size: 5 + Math.random() * 7,
    color: ['#34A853','#6ee7b7','#a7f3d0','#059669','#34d399','#fbbf24','#60a5fa'][i % 7],
    delay: Math.random() * 0.15,
    shape: i % 3 === 0 ? 'square' : 'circle',
  }));
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}>
      {items.map((p, i) => (
        <div key={i} style={{
          position:'absolute', width:p.size, height:p.size,
          borderRadius: p.shape === 'circle' ? '50%' : '2px',
          background: p.color,
          animation: `burst 0.9s ease-out ${p.delay}s both`,
          '--angle': `${p.angle}deg`, '--dist': `${p.dist}px`,
        } as any} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function FoodBanquetLogin() {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState('');
  const [focusEmail,  setFocusEmail]  = useState(false);
  const [focusPass,   setFocusPass]   = useState(false);
  const [shake,       setShake]       = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [btnHover,    setBtnHover]    = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => { const id = setTimeout(() => setMounted(true), 60); return () => clearTimeout(id); }, []);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 560); };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      showNotification.warning('Please enter both email and password');
      triggerShake(); return;
    }
    setIsLoading(true); setError('');
    try {
      const result = await dispatch(loginUser({ email, password }) as any);
      if (loginUser.fulfilled.match(result)) {
        const user = result.payload.user;
        showNotification.success(`Welcome back, ${user.name}!`);
        setSuccess(true);
        setTimeout(() => navigate(getDashboardRoute(user.role)), 1000);
      } else {
        const msg = result.payload || 'Login failed. Please check your credentials.';
        setError(msg); showNotification.error(msg); triggerShake();
      }
    } catch {
      const msg = 'Network error. Please check your connection and try again.';
      setError(msg); showNotification.error(msg); triggerShake();
    } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleLogin(); };

  const handleBtnMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btnRef.current.style.transform = `translate(${x * 0.15}px, ${y * 0.22}px) translateY(-1px)`;
  }, []);
  const handleBtnMouseLeave = useCallback(() => {
    if (btnRef.current) btnRef.current.style.transform = 'none';
    setBtnHover(false);
  }, []);

  const C = { primary: '#34A853', dark: '#166534', glow: 'rgba(52,168,83,0.22)' };

  const pwStrength = password.length === 0 ? 0 : password.length < 4 ? 1 : password.length < 8 ? 2 : 3;
  const pwColors = ['#e5e7eb', '#ef4444', '#fbbf24', C.primary];
  const pwLabels = ['', 'weak', 'fair', 'strong'];

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'DM Sans',system-ui,sans-serif", overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes fadeUp    { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeLeft  { from{opacity:0;transform:translateX(-26px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeRight { from{opacity:0;transform:translateX(26px)}  to{opacity:1;transform:translateX(0)} }
        @keyframes shake     { 0%,100%{transform:translateX(0)} 18%,54%{transform:translateX(-9px)} 36%,72%{transform:translateX(9px)} }
        @keyframes float     { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(3deg)} }
        @keyframes floatB    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(-2deg)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes gradMove  { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes ripple    { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(3.5);opacity:0} }
        @keyframes morph     { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        @keyframes morphB    { 0%,100%{border-radius:40% 60% 60% 40%/40% 40% 60% 60%} 50%{border-radius:60% 40% 40% 60%/60% 60% 40% 40%} }
        @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes slideIn   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn   { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
        @keyframes popIn     { 0%{transform:scale(0.7);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
        @keyframes pulse     { 0%,100%{box-shadow:0 0 0 0 rgba(52,168,83,0.45)} 50%{box-shadow:0 0 0 9px rgba(52,168,83,0)} }
        @keyframes burst     { 0%{transform:rotate(var(--angle)) translateX(0) scale(1);opacity:1} 100%{transform:rotate(var(--angle)) translateX(var(--dist)) scale(0);opacity:0} }
        @keyframes tickerSlide { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes barGrow   { from{width:0} to{width:100%} }
        @keyframes dotPulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.5)} }
        * { box-sizing:border-box; }
        .lp-input::placeholder { color:#9ca3af; font-family:inherit; }
        .row1{opacity:0;animation:slideIn 0.45s ease 0.3s both}
        .row2{opacity:0;animation:slideIn 0.45s ease 0.4s both}
        .row3{opacity:0;animation:slideIn 0.45s ease 0.5s both}
        .row4{opacity:0;animation:slideIn 0.45s ease 0.6s both}
        .row5{opacity:0;animation:slideIn 0.45s ease 0.7s both}
        .row6{opacity:0;animation:slideIn 0.45s ease 0.8s both}
        .stat1{opacity:0;animation:fadeLeft 0.5s ease 0.65s both}
        .stat2{opacity:0;animation:fadeLeft 0.5s ease 0.8s both}
        .stat3{opacity:0;animation:fadeLeft 0.5s ease 0.95s both}
      `}</style>

      <Confetti active={success} />

      {/* ══ LEFT PANEL ══ */}
      <div style={{ flex:'0 0 46%', position:'relative', overflow:'hidden', background:'linear-gradient(155deg,#052e16 0%,#064e3b 45%,#065f46 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 52px' }} className="hidden lg:flex">
        <ParticleCanvas />

        {/* Morphing blobs */}
        <div style={{ position:'absolute', top:'-6%', right:'-9%', width:300, height:300, background:'radial-gradient(circle,rgba(52,168,83,0.18),transparent 70%)', animation:'morph 8s ease-in-out infinite, float 7s ease-in-out infinite', filter:'blur(3px)' }} />
        <div style={{ position:'absolute', bottom:'-9%', left:'-6%', width:340, height:340, background:'radial-gradient(circle,rgba(16,185,129,0.12),transparent 70%)', animation:'morphB 11s ease-in-out infinite, floatB 9s ease-in-out infinite', filter:'blur(5px)' }} />
        <div style={{ position:'absolute', top:'38%', right:'2%', width:150, height:150, background:'radial-gradient(circle,rgba(52,211,153,0.18),transparent 70%)', animation:'morph 6s ease-in-out infinite reverse', filter:'blur(10px)' }} />

        <div style={{ position:'relative', zIndex:2 }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:48, opacity:0, animation:'scaleIn 0.5s ease 0.2s both' }}>
            <div style={{ width:48, height:48, borderRadius:16, background:'linear-gradient(135deg,#34A853,#059669)', display:'flex', alignItems:'center', justifyContent:'center', animation:'pulse 2.5s ease-in-out infinite, float 4s ease-in-out infinite', boxShadow:'0 4px 20px rgba(52,168,83,0.5)' }}>
              <Leaf size={23} color="#fff" />
            </div>
            <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.5rem', color:'#fff', letterSpacing:'-0.01em' }}>RescueNet</span>
          </div>

          {/* Typewriter headline */}
          <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'clamp(1.9rem,2.8vw,2.8rem)', fontWeight:700, color:'#fff', lineHeight:1.18, marginBottom:16, letterSpacing:'-0.02em', opacity:0, animation:'fadeUp 0.6s ease 0.3s both' }}>
            Food saved is<br />
            <Typewriter phrases={['lives changed.','hope delivered.','waste defeated.','futures fed.']} />
          </h1>

          <p style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.55)', lineHeight:1.8, maxWidth:310, marginBottom:44, opacity:0, animation:'fadeUp 0.6s ease 0.45s both' }}>
            Join thousands of donors, volunteers, and recipients working together to end food waste.
          </p>

          {/* Stats with animated counters */}
          {[
            { cls:'stat1', to:12400, suffix:'+', label:'Meals redistributed', icon:'🍱' },
            { cls:'stat2', to:340,   suffix:'+', label:'Active donors',        icon:'💚' },
            { cls:'stat3', to:98,    suffix:'%', label:'Same-day pickup',      icon:'⚡' },
          ].map(({ cls, to, suffix, label, icon }) => (
            <div key={label} className={cls} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
              <div style={{ width:44, height:44, borderRadius:13, flexShrink:0, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.15rem', transition:'all 0.3s', cursor:'default' }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background='rgba(52,168,83,0.22)'; (e.currentTarget as HTMLElement).style.transform='scale(1.1) rotate(5deg)'; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.transform='none'; }}
              >{icon}</div>
              <div>
                <div style={{ fontSize:'1.08rem', fontWeight:800, color:'#fff', letterSpacing:'-0.01em' }}><Counter to={to} suffix={suffix} /></div>
                <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.42)', marginTop:1 }}>{label}</div>
              </div>
            </div>
          ))}

          {/* Scrolling ticker */}
          <div style={{ marginTop:28, overflow:'hidden', borderRadius:99, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', padding:'7px 0', opacity:0, animation:'fadeUp 0.5s ease 1.1s both' }}>
            <div style={{ display:'flex', gap:32, animation:'tickerSlide 18s linear infinite', whiteSpace:'nowrap' }}>
              {['🍱 12 donations today','⚡ 3 pickups pending','💚 New donor joined','🥗 Salad batch available','🍞 Bakery surplus nearby',
                '🍱 12 donations today','⚡ 3 pickups pending','💚 New donor joined','🥗 Salad batch available','🍞 Bakery surplus nearby'].map((t, i) => (
                <span key={i} style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.5)', fontWeight:600, paddingLeft: i === 0 ? 16 : 0 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Live badge */}
          <div style={{ marginTop:16, display:'inline-flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:99, padding:'8px 16px 8px 10px', opacity:0, animation:'fadeUp 0.5s ease 1.2s both' }}>
            <div style={{ position:'relative', width:10, height:10, flexShrink:0 }}>
              <div style={{ position:'absolute', inset:0, background:'#34d399', borderRadius:'50%', animation:'dotPulse 1.5s ease-in-out infinite' }} />
              <div style={{ position:'absolute', inset:0, background:'#34d399', borderRadius:'50%', animation:'ripple 2s ease-out infinite' }} />
            </div>
            <span style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.6)', fontWeight:600 }}>Live — 23 donations active right now</span>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px', background:'#f9fafb', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle,#34A85309 1px,transparent 1px)', backgroundSize:'24px 24px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:-100, right:-100, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,rgba(52,168,83,0.07),transparent 70%)', animation:'float 8s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, left:-80, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.05),transparent 70%)', animation:'floatB 10s ease-in-out infinite', pointerEvents:'none' }} />

        <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:2, opacity:mounted?1:0, transform:mounted?'none':'translateY(20px)', transition:'opacity 0.6s ease, transform 0.6s ease' }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden" style={{ alignItems:'center', gap:10, marginBottom:28 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#34A853,#059669)', display:'flex', alignItems:'center', justifyContent:'center', animation:'pulse 2.5s ease-in-out infinite' }}>
              <Leaf size={18} color="#fff" />
            </div>
            <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.2rem', color:'#065f46' }}>RescueNet</span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom:24, opacity:0, animation:'fadeRight 0.55s ease 0.2s both' }}>
            <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'2rem', fontWeight:700, color:'#111827', marginBottom:6, letterSpacing:'-0.02em' }}>Welcome back</h2>
            <p style={{ fontSize:'0.875rem', color:'#6b7280' }}>Sign in to continue making an impact</p>
          </div>

          {/* SUCCESS STATE */}
          {success ? (
            <div style={{ background:'#fff', borderRadius:22, padding:'44px 28px', textAlign:'center', boxShadow:'0 8px 40px rgba(52,168,83,0.18)', animation:'popIn 0.5s ease both' }}>
              <div style={{ width:68, height:68, borderRadius:'50%', background:'linear-gradient(135deg,#34A853,#059669)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 8px 28px rgba(52,168,83,0.45)', animation:'pulse 1.5s ease-in-out infinite' }}>
                <span style={{ fontSize:'2rem', color:'#fff' }}>✓</span>
              </div>
              <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:'1.5rem', color:'#111827', marginBottom:8 }}>Signed in!</h3>
              <p style={{ fontSize:'0.875rem', color:'#6b7280', marginBottom:20 }}>Redirecting to your dashboard...</p>
              <div style={{ height:4, background:'#f3f4f6', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', background:'linear-gradient(90deg,#34A853,#059669)', borderRadius:99, animation:'barGrow 0.9s ease both' }} />
              </div>
            </div>
          ) : (
            /* ── CARD ── */
            <div style={{ background:'#fff', borderRadius:22, padding:'28px 28px 24px', animation: shake ? 'shake 0.5s ease' : 'none', transition:'box-shadow 0.3s', boxShadow: (focusEmail||focusPass) ? '0 12px 50px rgba(52,168,83,0.16),0 2px 12px rgba(0,0,0,0.06)' : '0 8px 40px rgba(52,168,83,0.09),0 2px 12px rgba(0,0,0,0.05)' }}>

              {error && (
                <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'10px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8, animation:'slideIn 0.3s ease both' }}>
                  <AlertCircle size={14} color="#dc2626" />
                  <p style={{ fontSize:'0.8rem', color:'#dc2626', fontWeight:500 }}>{error}</p>
                </div>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* Email */}
                <div className="row1">
                  <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#374151', marginBottom:6, letterSpacing:'0.05em' }}>EMAIL ADDRESS</label>
                  <div style={{ position:'relative' }}>
                    <Mail size={14} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:focusEmail?C.primary:'#9ca3af', transition:'color 0.25s', pointerEvents:'none' }} />
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                      onFocus={()=>setFocusEmail(true)} onBlur={()=>setFocusEmail(false)}
                      onKeyDown={handleKeyDown} placeholder="you@example.com" className="lp-input"
                      style={{ width:'100%', padding:'12px 36px 12px 40px', border:`1.5px solid ${focusEmail?C.primary:'#e5e7eb'}`, borderRadius:10, fontSize:'0.875rem', color:'#111827', background:focusEmail?'#f0fdf4':'#fafafa', outline:'none', transition:'all 0.25s cubic-bezier(0.4,0,0.2,1)', boxShadow:focusEmail?`0 0 0 3px ${C.glow},0 2px 8px rgba(52,168,83,0.08)`:'none', fontFamily:'inherit' }}
                    />
                    {email && <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', width:7, height:7, borderRadius:'50%', background:C.primary, animation:'scaleIn 0.2s ease, dotPulse 2s ease-in-out infinite' }} />}
                  </div>
                </div>

                {/* Password */}
                <div className="row2">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <label style={{ fontSize:'0.72rem', fontWeight:700, color:'#374151', letterSpacing:'0.05em' }}>PASSWORD</label>
                    <button type="button" style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.75rem', color:C.primary, fontWeight:600, fontFamily:'inherit', transition:'opacity 0.2s' }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.opacity='0.65'}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.opacity='1'}}
                    >Forgot password?</button>
                  </div>
                  <div style={{ position:'relative' }}>
                    <Lock size={14} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:focusPass?C.primary:'#9ca3af', transition:'color 0.25s', pointerEvents:'none' }} />
                    <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                      onFocus={()=>setFocusPass(true)} onBlur={()=>setFocusPass(false)}
                      onKeyDown={handleKeyDown} placeholder="••••••••" className="lp-input"
                      style={{ width:'100%', padding:'12px 40px 12px 40px', border:`1.5px solid ${focusPass?C.primary:'#e5e7eb'}`, borderRadius:10, fontSize:'0.875rem', color:'#111827', background:focusPass?'#f0fdf4':'#fafafa', outline:'none', transition:'all 0.25s cubic-bezier(0.4,0,0.2,1)', boxShadow:focusPass?`0 0 0 3px ${C.glow},0 2px 8px rgba(52,168,83,0.08)`:'none', fontFamily:'inherit' }}
                    />
                    <button type="button" onClick={()=>setShowPass(!showPass)}
                      style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex', padding:0, transition:'color 0.2s, transform 0.2s' }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color=C.primary;(e.currentTarget as HTMLElement).style.transform='translateY(-50%) scale(1.18)'}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='#9ca3af';(e.currentTarget as HTMLElement).style.transform='translateY(-50%) scale(1)'}}
                    >{showPass ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                  </div>
                  {/* Password strength */}
                  {password.length > 0 && (
                    <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:6, animation:'slideIn 0.25s ease both' }}>
                      {[1,2,3].map(i => (
                        <div key={i} style={{ flex:1, height:3, borderRadius:99, background: pwStrength >= i ? pwColors[pwStrength] : '#e5e7eb', transition:'background 0.35s ease' }} />
                      ))}
                      <span style={{ fontSize:'0.65rem', color: pwColors[pwStrength], fontWeight:700, minWidth:36, transition:'color 0.35s' }}>{pwLabels[pwStrength]}</span>
                    </div>
                  )}
                </div>

                {/* Magnetic shimmer submit button */}
                <div className="row3" style={{ marginTop: password.length > 0 ? 4 : 0 }}>
                  <button ref={btnRef} onClick={handleLogin} disabled={isLoading}
                    onMouseMove={handleBtnMouseMove}
                    onMouseEnter={()=>setBtnHover(true)}
                    onMouseLeave={handleBtnMouseLeave}
                    style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', cursor:isLoading?'not-allowed':'pointer', position:'relative', overflow:'hidden', background:isLoading?'#86efac':`linear-gradient(135deg,${C.primary},#059669)`, color:'#fff', fontWeight:700, fontSize:'0.92rem', fontFamily:'inherit', boxShadow:isLoading?'none':btnHover?'0 12px 32px rgba(52,168,83,0.45),0 4px 12px rgba(52,168,83,0.2)':`0 4px 20px ${C.glow}`, transition:'box-shadow 0.3s,background 0.3s', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    {!isLoading && <div style={{ position:'absolute', inset:0, borderRadius:12, background:'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.28) 50%,transparent 60%)', backgroundSize:'200% auto', animation:btnHover?'shimmer 0.65s linear infinite':'none', pointerEvents:'none' }} />}
                    {isLoading
                      ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.35)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>Signing in...</>
                      : <><LogIn size={15}/>Sign In<ArrowRight size={14} style={{ transition:'transform 0.2s', transform:btnHover?'translateX(4px)':'none' }}/></>
                    }
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="row4" style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0 16px' }}>
                <div style={{ flex:1, height:1, background:'#f3f4f6' }} />
                <span style={{ fontSize:'0.72rem', color:'#9ca3af', fontWeight:500, whiteSpace:'nowrap' }}>or continue with</span>
                <div style={{ flex:1, height:1, background:'#f3f4f6' }} />
              </div>

              {/* Social buttons */}
              <div className="row5" style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { label:'Continue with Google', icon:<svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
                  { label:'Continue with Apple',  icon:<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> },
                ].map(({ label, icon }) => (
                  <button key={label} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'11px 16px', borderRadius:10, background:'#fafafa', border:'1.5px solid #e5e7eb', color:'#374151', fontWeight:600, fontSize:'0.845rem', fontFamily:'inherit', cursor:'pointer', transition:'all 0.22s cubic-bezier(0.4,0,0.2,1)' }}
                    onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.background='#f0fdf4'; el.style.borderColor='#86efac'; el.style.transform='translateY(-2px)'; el.style.boxShadow='0 5px 14px rgba(52,168,83,0.13)'; }}
                    onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.background='#fafafa'; el.style.borderColor='#e5e7eb'; el.style.transform='none'; el.style.boxShadow='none'; }}
                  >{icon}{label}</button>
                ))}
              </div>

              {/* Sign up */}
              <div className="row6" style={{ textAlign:'center', marginTop:18 }}>
                <p style={{ fontSize:'0.845rem', color:'#6b7280' }}>
                  Don't have an account?{' '}
                  <button onClick={()=>navigate('/register')} style={{ background:'none', border:'none', cursor:'pointer', color:C.primary, fontWeight:700, fontFamily:'inherit', fontSize:'0.845rem', textDecoration:'underline', textDecorationColor:'transparent', textUnderlineOffset:3, transition:'text-decoration-color 0.2s' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.textDecorationColor=C.primary}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.textDecorationColor='transparent'}}
                  >Sign Up</button>
                </p>
              </div>
            </div>
          )}

          <p style={{ textAlign:'center', fontSize:'0.7rem', color:'#9ca3af', marginTop:16, opacity:0, animation:'fadeUp 0.5s ease 1.1s both' }}>
            🔒 Secure login · Your data is never shared or sold
          </p>
        </div>
      </div>
    </div>
  );
}