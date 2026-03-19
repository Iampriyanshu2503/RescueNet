import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Heart, HelpCircle, Link2, Truck, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ROLES = [
  {
    key: 'donor',
    Icon: Heart,
    label: 'Donor',
    sub: 'Give surplus a second life',
    desc: 'Share your surplus food with those who need it most and turn waste into nourishment.',
    features: ['List surplus food instantly', 'Track all donations', 'View impact analytics', 'Manage pickups'],
    color: '#3b82f6', colorLight: '#eff6ff', colorMid: '#bfdbfe', shadow: 'rgba(59,130,246,0.18)', num: '01',
  },
  {
    key: 'recipient',
    Icon: Link2,
    label: 'Recipient',
    sub: 'Find food near you',
    desc: 'Discover available donations in your community and request what your organisation needs.',
    features: ['Browse food listings', 'Request donations', 'Track pickup history', 'Search by location'],
    color: '#34A853', colorLight: '#f0fdf4', colorMid: '#bbf7d0', shadow: 'rgba(52,168,83,0.18)', num: '02',
  },
  {
    key: 'volunteer',
    Icon: Truck,
    label: 'Volunteer',
    sub: 'Be the bridge',
    desc: 'Deliver food from donors to recipients and become the backbone of our community.',
    features: ['Accept delivery tasks', 'Coordinate pickups', 'Track deliveries', 'Build community impact'],
    color: '#9333ea', colorLight: '#faf5ff', colorMid: '#e9d5ff', shadow: 'rgba(147,51,234,0.18)', num: '03',
  },
];

/* ── Success Screen ── */
function RegistrationSuccess({ role, name, onNavigate }: { role: string; name: string; onNavigate: () => void }) {
  const [countdown, setCountdown] = useState(3);
  const roleConfig = ROLES.find(r => r.key === role) || ROLES[0];

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); onNavigate(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onNavigate]);

  const dashMap: Record<string, string> = {
    donor: '/donor-dashboard',
    recipient: '/recipient-dashboard',
    volunteer: '/volunteer-dashboard',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${roleConfig.colorLight} 0%, #ffffff 50%, ${roleConfig.colorLight} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif", padding: 24,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');
        @keyframes popIn    { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shrink   { from{width:100%} to{width:0%} }
        @keyframes confetti { 0%{transform:translateY(0) rotate(0)} 100%{transform:translateY(120vh) rotate(720deg)} }
        @keyframes sparkle  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.6)} }
        * { box-sizing:border-box; }
      `}</style>

      {/* Confetti particles */}
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{
          position: 'fixed',
          top: -20,
          left: `${5 + i * 8}%`,
          width: 8, height: 8,
          borderRadius: i % 3 === 0 ? '50%' : 2,
          background: [roleConfig.color, '#f59e0b', '#22c55e', '#ec4899', '#3b82f6'][i % 5],
          animation: `confetti ${2 + (i % 3) * 0.5}s ease-in ${i * 0.15}s forwards`,
          pointerEvents: 'none', zIndex: 0,
          opacity: 0,
        }} />
      ))}

      <div style={{
        position: 'relative', zIndex: 1,
        background: '#fff',
        borderRadius: 32,
        boxShadow: `0 32px 80px ${roleConfig.shadow}, 0 8px 24px rgba(0,0,0,0.06)`,
        padding: '52px 44px',
        maxWidth: 480, width: '100%',
        textAlign: 'center',
        animation: 'popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
        border: `1.5px solid ${roleConfig.colorMid}`,
      }}>
        {/* Success icon */}
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: `linear-gradient(135deg, ${roleConfig.color}, ${roleConfig.color}cc)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: `0 16px 48px ${roleConfig.shadow}`,
          animation: 'float 3s ease-in-out infinite',
        }}>
          <CheckCircle size={42} color="#fff" strokeWidth={2.5} />
        </div>

        {/* Sparkle dots */}
        {[[-30,-20], [30,-20], [-40,10], [40,10]].map(([x, y], i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `calc(30% + ${y}px)`,
            left: `calc(50% + ${x}px)`,
            width: 8, height: 8, borderRadius: '50%',
            background: roleConfig.color,
            animation: `sparkle 1.5s ease-in-out ${i * 0.2}s infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: roleConfig.colorLight, border: `1px solid ${roleConfig.colorMid}`,
          borderRadius: 99, padding: '5px 14px', marginBottom: 16,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: roleConfig.color, display: 'inline-block', animation: 'sparkle 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: roleConfig.color, letterSpacing: '0.1em' }}>
            REGISTRATION SUCCESSFUL
          </span>
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 700, color: '#0f172a',
          marginBottom: 10, lineHeight: 1.2,
        }}>
          Welcome{name ? `, ${name.split(' ')[0]}` : ''}! 🎉
        </h2>

        <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.7, marginBottom: 28, maxWidth: 320, margin: '0 auto 28px' }}>
          You're now registered as a <strong style={{ color: roleConfig.color }}>{roleConfig.label}</strong> on RescueNet.
          Let's make a difference together!
        </p>

        {/* Role badge */}
        <div style={{
          background: roleConfig.colorLight,
          border: `1.5px solid ${roleConfig.colorMid}`,
          borderRadius: 18, padding: '16px 24px',
          marginBottom: 28, textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: roleConfig.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: `0 4px 14px ${roleConfig.shadow}`,
          }}>
            <roleConfig.Icon size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Your Role</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{roleConfig.label}</p>
            <p style={{ fontSize: '0.75rem', color: roleConfig.color, fontWeight: 600 }}>{roleConfig.sub}</p>
          </div>
        </div>

        {/* CTA button */}
        <button
          onClick={onNavigate}
          style={{
            width: '100%', padding: '15px 24px', borderRadius: 16,
            background: `linear-gradient(135deg, ${roleConfig.color}, ${roleConfig.color}cc)`,
            border: 'none', color: '#fff', fontWeight: 800,
            fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: `0 8px 24px ${roleConfig.shadow}`,
            transition: 'all 0.2s',
            marginBottom: 14,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${roleConfig.shadow}`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
        >
          Go to Dashboard
          <ArrowRight size={18} />
        </button>

        {/* Countdown bar */}
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 8 }}>
            Redirecting automatically in <strong style={{ color: roleConfig.color }}>{countdown}s</strong>
          </p>
          <div style={{ height: 3, background: roleConfig.colorMid, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: roleConfig.color, borderRadius: 99,
              animation: 'shrink 3s linear forwards',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Register Page ── */
export default function RegisterPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [hovered,  setHovered]  = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [mounted,  setMounted]  = useState(false);

  // Check if we're being shown after successful registration
  const successState = location.state as { registered?: boolean; role?: string; name?: string } | null;
  const [showSuccess, setShowSuccess] = useState(!!successState?.registered);
  const [successRole, setSuccessRole] = useState(successState?.role || 'donor');
  const [successName, setSuccessName] = useState(successState?.name || '');

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const handleNavigateToDashboard = () => {
    const dashMap: Record<string, string> = {
      donor: '/donor-dashboard',
      recipient: '/recipient-dashboard',
      volunteer: '/volunteer-dashboard',
    };
    navigate(dashMap[successRole] || '/donor-dashboard');
  };

  const handleRoleSelect = (role: string) => {
    setSelected(role);
    setTimeout(() => {
      if (role === 'donor')     navigate('/donor-register');
      else if (role === 'recipient') navigate('/recipient-register');
      else if (role === 'volunteer') navigate('/volunteer-register');
    }, 350);
  };

  const tilt = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const el = cardRefs.current[idx];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px) scale(1.02)`;
  };

  const resetTilt = (idx: number) => {
    const el = cardRefs.current[idx];
    if (el) el.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateY(0) scale(1)';
  };

  if (showSuccess) {
    return <RegistrationSuccess role={successRole} name={successName} onNavigate={handleNavigateToDashboard} />;
  }

  const active = hovered || selected;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #f7f7f7 50%, #eff6ff 100%)',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 20px 48px', position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:0% center} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; }
      `}</style>

      {/* Decorative blobs */}
      <div style={{ position:'fixed', top:-120, right:-120, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(52,168,83,0.12), transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:-100, left:-100, width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, opacity:0.5, backgroundImage:'radial-gradient(circle, #34A85318 1px, transparent 1px)', backgroundSize:'28px 28px' }} />

      {/* Back button */}
      <button onClick={() => navigate('/login')} style={{ position:'fixed', top:20, left:20, zIndex:50, width:40, height:40, borderRadius:'50%', background:'#fff', border:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#6b7280', boxShadow:'0 1px 6px rgba(0,0,0,0.08)', transition:'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 14px rgba(0,0,0,0.12)'; e.currentTarget.style.color='#111827'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 6px rgba(0,0,0,0.08)'; e.currentTarget.style.color='#6b7280'; }}>
        <ArrowLeft className="w-4 h-4" />
      </button>

      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:1020 }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:48, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(-16px)', transition:'all 0.6s cubic-bezier(0.23,1,0.32,1)' }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:64, height:64, borderRadius:20, marginBottom:20, background:'linear-gradient(135deg, #34A853, #2E8B57)', boxShadow:'0 8px 32px rgba(52,168,83,0.3)', animation:'float 3s ease-in-out infinite' }}>
            <Heart className="w-7 h-7 text-white" style={{ fill:'white' }} />
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:100, padding:'5px 14px', marginBottom:16 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#34A853', boxShadow:'0 0 6px #34A853', display:'inline-block', animation:'blink 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize:'0.68rem', fontWeight:700, color:'#34A853', letterSpacing:'0.1em' }}>RESCUENET · JOIN THE MISSION</span>
          </div>
          <h1 style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontSize:'clamp(1.9rem, 5vw, 3rem)', fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.1, color:'#111827', marginBottom:10 }}>
            How would you like to{' '}
            <span style={{ background:'linear-gradient(90deg, #34A853, #2E8B57, #34A853)', backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'shimmer 3s linear infinite', fontStyle:'italic' }}>help?</span>
          </h1>
          <p style={{ fontSize:'1rem', color:'#6b7280', maxWidth:400, margin:'0 auto', lineHeight:1.65 }}>
            Choose your role in building a community where no food goes to waste
          </p>
        </div>

        {/* Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20, marginBottom:36 }}>
          {ROLES.map((role, i) => {
            const isActive = hovered === role.key || selected === role.key;
            const isDimmed = active && active !== role.key;
            return (
              <div key={role.key} ref={el => { cardRefs.current[i] = el; }}
                onClick={() => handleRoleSelect(role.key)}
                onMouseEnter={() => setHovered(role.key)}
                onMouseLeave={() => { setHovered(null); resetTilt(i); }}
                onMouseMove={e => tilt(e, i)}
                style={{ position:'relative', overflow:'hidden', borderRadius:20, padding:'28px 24px', cursor:'pointer', userSelect:'none', background:isActive ? role.colorLight : '#ffffff', border:`1.5px solid ${isActive ? role.color+'50' : '#e5e7eb'}`, opacity:isDimmed ? 0.5 : 1, transition:'all 0.35s cubic-bezier(0.23,1,0.32,1)', boxShadow:isActive ? `0 20px 48px ${role.shadow}, 0 4px 16px rgba(0,0,0,0.05)` : '0 2px 12px rgba(0,0,0,0.06)', animation:`fadeUp 0.5s ease ${0.08 + i * 0.1}s both`, willChange:'transform' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:role.color, borderRadius:'20px 20px 0 0', opacity:isActive?1:0, transition:'opacity 0.3s ease' }} />
                <div style={{ position:'absolute', top:16, right:16, width:28, height:28, borderRadius:8, background:isActive?role.color:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.62rem', fontWeight:800, color:isActive?'#fff':'#9ca3af', transition:'all 0.3s ease' }}>{role.num}</div>
                <div style={{ width:56, height:56, borderRadius:16, background:isActive?role.color:role.colorLight, border:`1.5px solid ${isActive?'transparent':role.colorMid}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, transition:'all 0.4s cubic-bezier(0.34,1.56,0.64,1)', transform:isActive?'scale(1.12) rotate(-5deg)':'scale(1)', boxShadow:isActive?`0 8px 24px ${role.shadow}`:'none' }}>
                  <role.Icon className="w-6 h-6" style={{ color:isActive?'#fff':role.color }} />
                </div>
                <h3 style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontSize:'1.25rem', fontWeight:700, color:'#111827', marginBottom:3, letterSpacing:'-0.01em' }}>{role.label}</h3>
                <p style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:role.color, marginBottom:12, opacity:isActive?1:0.7, transition:'opacity 0.3s' }}>{role.sub}</p>
                <p style={{ fontSize:'0.83rem', color:'#6b7280', lineHeight:1.7, marginBottom:18 }}>{role.desc}</p>
                <ul style={{ listStyle:'none', padding:0, margin:'0 0 20px' }}>
                  {role.features.map((f, fi) => (
                    <li key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.8rem', color:'#4b5563', marginBottom:7, transform:isActive?'translateX(4px)':'translateX(0)', transition:`transform 0.3s ease ${fi * 0.04}s` }}>
                      <span style={{ width:18, height:18, borderRadius:6, flexShrink:0, background:isActive?role.color:role.colorLight, border:`1px solid ${isActive?'transparent':role.colorMid}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:isActive?'#fff':role.color, fontWeight:800, transition:'all 0.3s ease' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div style={{ width:'100%', padding:'11px 18px', borderRadius:12, background:isActive?role.color:'#f9fafb', border:`1px solid ${isActive?'transparent':'#e5e7eb'}`, color:isActive?'#fff':'#374151', fontWeight:700, fontSize:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.3s ease', boxShadow:isActive?`0 4px 16px ${role.shadow}`:'none' }}>
                  {selected === role.key ? 'Opening...' : `Register as ${role.label}`}
                  <ArrowRight className="w-4 h-4" style={{ transform:isActive?'translateX(3px)':'none', transition:'transform 0.3s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign:'center', opacity:mounted?1:0, transition:'opacity 0.6s ease 0.4s' }}>
          <p style={{ fontSize:'0.85rem', color:'#9ca3af' }}>Start your journey in building a community where no food goes to waste</p>
          <p style={{ fontSize:'0.82rem', color:'#9ca3af', marginTop:6 }}>
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} style={{ background:'none', border:'none', cursor:'pointer', color:'#34A853', fontWeight:700, fontSize:'0.82rem', fontFamily:'inherit', transition:'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#2E8B57')}
              onMouseLeave={e => (e.currentTarget.style.color = '#34A853')}>Sign In</button>
          </p>
        </div>
      </div>

      <button style={{ position:'fixed', bottom:22, right:22, zIndex:50, width:48, height:48, borderRadius:'50%', background:'#1f2937', color:'#fff', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 4px 16px rgba(0,0,0,0.2)', transition:'background 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#374151')}
        onMouseLeave={e => (e.currentTarget.style.background = '#1f2937')}>
        <HelpCircle className="w-5 h-5" />
      </button>
    </div>
  );
}