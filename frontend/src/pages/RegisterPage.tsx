import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Heart, HelpCircle, Link2, Truck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROLES = [
  {
    key: 'donor',
    Icon: Heart,
    label: 'Donor',
    sub: 'Give surplus a second life',
    desc: 'Share your surplus food with those who need it most and turn waste into nourishment.',
    features: ['List surplus food instantly', 'Track all donations', 'View impact analytics', 'Manage pickups'],
    color: '#3b82f6',
    colorLight: '#eff6ff',
    colorMid: '#bfdbfe',
    shadow: 'rgba(59,130,246,0.18)',
    num: '01',
  },
  {
    key: 'recipient',
    Icon: Link2,
    label: 'Recipient',
    sub: 'Find food near you',
    desc: 'Discover available donations in your community and request what your organisation needs.',
    features: ['Browse food listings', 'Request donations', 'Track pickup history', 'Search by location'],
    color: '#34A853',
    colorLight: '#f0fdf4',
    colorMid: '#bbf7d0',
    shadow: 'rgba(52,168,83,0.18)',
    num: '02',
  },
  {
    key: 'volunteer',
    Icon: Truck,
    label: 'Volunteer',
    sub: 'Be the bridge',
    desc: 'Deliver food from donors to recipients and become the backbone of our community.',
    features: ['Accept delivery tasks', 'Coordinate pickups', 'Track deliveries', 'Build community impact'],
    color: '#9333ea',
    colorLight: '#faf5ff',
    colorMid: '#e9d5ff',
    shadow: 'rgba(147,51,234,0.18)',
    num: '03',
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const handleRoleSelect = (role: string) => {
    setSelected(role);
    setTimeout(() => {
      if (role === 'donor') navigate('/donor-register');
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:0% center} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; }
      `}</style>

      {/* Decorative blobs */}
      <div style={{
        position: 'fixed', top: -120, right: -120, width: 400, height: 400,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,168,83,0.12), transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: -100, left: -100, width: 350, height: 350,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Dot pattern */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.5,
        backgroundImage: 'radial-gradient(circle, #34A85318 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Back button */}
      <button onClick={() => navigate('/login')} style={{
        position: 'fixed', top: 20, left: 20, zIndex: 50,
        width: 40, height: 40, borderRadius: '50%',
        background: '#fff', border: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#6b7280',
        boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)'; e.currentTarget.style.color = '#111827'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.08)'; e.currentTarget.style.color = '#6b7280'; }}
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 1020 }}>

        {/* Header */}
        <div style={{
          textAlign: 'center', marginBottom: 48,
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-16px)',
          transition: 'all 0.6s cubic-bezier(0.23,1,0.32,1)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 20, marginBottom: 20,
            background: 'linear-gradient(135deg, #34A853, #2E8B57)',
            boxShadow: '0 8px 32px rgba(52,168,83,0.3)',
            animation: 'float 3s ease-in-out infinite',
          }}>
            <Heart className="w-7 h-7 text-white" style={{ fill: 'white' }} />
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 100, padding: '5px 14px', marginBottom: 16,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#34A853',
              boxShadow: '0 0 6px #34A853', display: 'inline-block',
              animation: 'blink 1.5s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#34A853', letterSpacing: '0.1em' }}>
              RESCUENET · JOIN THE MISSION
            </span>
          </div>

          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(1.9rem, 5vw, 3rem)',
            fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1,
            color: '#111827', marginBottom: 10,
          }}>
            How would you like to{' '}
            <span style={{
              background: 'linear-gradient(90deg, #34A853, #2E8B57, #34A853)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
              fontStyle: 'italic',
            }}>help?</span>
          </h1>

          <p style={{ fontSize: '1rem', color: '#6b7280', maxWidth: 400, margin: '0 auto', lineHeight: 1.65 }}>
            Choose your role in building a community where no food goes to waste
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20, marginBottom: 36,
        }}>
          {ROLES.map((role, i) => {
            const isActive = hovered === role.key || selected === role.key;
            const isDimmed = active && active !== role.key;

            return (
              <div
                key={role.key}
                ref={el => { cardRefs.current[i] = el; }}
                onClick={() => handleRoleSelect(role.key)}
                onMouseEnter={() => setHovered(role.key)}
                onMouseLeave={() => { setHovered(null); resetTilt(i); }}
                onMouseMove={e => tilt(e, i)}
                style={{
                  position: 'relative', overflow: 'hidden',
                  borderRadius: 20, padding: '28px 24px',
                  cursor: 'pointer', userSelect: 'none',
                  background: isActive ? role.colorLight : '#ffffff',
                  border: `1.5px solid ${isActive ? role.color + '50' : '#e5e7eb'}`,
                  opacity: isDimmed ? 0.5 : 1,
                  transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)',
                  boxShadow: isActive
                    ? `0 20px 48px ${role.shadow}, 0 4px 16px rgba(0,0,0,0.05)`
                    : '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
                  animation: `fadeUp 0.5s ease ${0.08 + i * 0.1}s both`,
                  willChange: 'transform',
                }}
              >
                {/* Top color bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: role.color, borderRadius: '20px 20px 0 0',
                  opacity: isActive ? 1 : 0, transition: 'opacity 0.3s ease',
                }} />

                {/* Number badge */}
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 28, height: 28, borderRadius: 8,
                  background: isActive ? role.color : '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.62rem', fontWeight: 800,
                  color: isActive ? '#fff' : '#9ca3af',
                  transition: 'all 0.3s ease',
                }}>{role.num}</div>

                {/* Icon */}
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: isActive ? role.color : role.colorLight,
                  border: `1.5px solid ${isActive ? 'transparent' : role.colorMid}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                  transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: isActive ? 'scale(1.12) rotate(-5deg)' : 'scale(1)',
                  boxShadow: isActive ? `0 8px 24px ${role.shadow}` : 'none',
                }}>
                  <role.Icon className="w-6 h-6" style={{ color: isActive ? '#fff' : role.color }} />
                </div>

                <h3 style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: '1.25rem', fontWeight: 700,
                  color: '#111827', marginBottom: 3, letterSpacing: '-0.01em',
                }}>{role.label}</h3>

                <p style={{
                  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: role.color,
                  marginBottom: 12,
                  opacity: isActive ? 1 : 0.7, transition: 'opacity 0.3s',
                }}>{role.sub}</p>

                <p style={{
                  fontSize: '0.83rem', color: '#6b7280',
                  lineHeight: 1.7, marginBottom: 18,
                }}>{role.desc}</p>

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                  {role.features.map((f, fi) => (
                    <li key={f} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: '0.8rem', color: '#4b5563', marginBottom: 7,
                      transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                      transition: `transform 0.3s ease ${fi * 0.04}s`,
                    }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: 6, flexShrink: 0,
                        background: isActive ? role.color : role.colorLight,
                        border: `1px solid ${isActive ? 'transparent' : role.colorMid}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: isActive ? '#fff' : role.color,
                        fontWeight: 800, transition: 'all 0.3s ease',
                      }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <div style={{
                  width: '100%', padding: '11px 18px', borderRadius: 12,
                  background: isActive ? role.color : '#f9fafb',
                  border: `1px solid ${isActive ? 'transparent' : '#e5e7eb'}`,
                  color: isActive ? '#fff' : '#374151',
                  fontWeight: 700, fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? `0 4px 16px ${role.shadow}` : 'none',
                }}>
                  {selected === role.key ? 'Opening...' : `Register as ${role.label}`}
                  <ArrowRight className="w-4 h-4" style={{
                    transform: isActive ? 'translateX(3px)' : 'none',
                    transition: 'transform 0.3s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.6s ease 0.4s',
        }}>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
            Start your journey in building a community where no food goes to waste
          </p>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: 6 }}>
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#34A853', fontWeight: 700, fontSize: '0.82rem',
              fontFamily: 'inherit', transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#2E8B57')}
              onMouseLeave={e => (e.currentTarget.style.color = '#34A853')}
            >Sign In</button>
          </p>
        </div>
      </div>

      {/* Help button */}
      <button style={{
        position: 'fixed', bottom: 22, right: 22, zIndex: 50,
        width: 48, height: 48, borderRadius: '50%',
        background: '#1f2937', color: '#fff', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        transition: 'background 0.2s',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = '#374151')}
        onMouseLeave={e => (e.currentTarget.style.background = '#1f2937')}
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    </div>
  );
}