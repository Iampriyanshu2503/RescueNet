import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Heart, Eye, EyeOff, Building, CheckCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../store/authSlice';

type FormData = {
  firstName: string; lastName: string; email: string; phone: string;
  password: string; confirmPassword: string; address: string; organization: string;
};
type FormErrors = Partial<Record<keyof FormData | 'submit', string>>;

const ORGANIZATION_OPTIONS = [
  { value: '', label: 'Select organization type' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'canteen', label: 'Canteen' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'catering', label: 'Catering Service' },
  { value: 'grocery', label: 'Grocery Store' },
  { value: 'supermarket', label: 'Supermarket' },
  { value: 'food_court', label: 'Food Court' },
  { value: 'individual', label: 'Individual' },
  { value: 'other', label: 'Other' },
];

const C = { primary: '#3b82f6', light: '#eff6ff', mid: '#bfdbfe', dark: '#1d4ed8', glow: 'rgba(59,130,246,0.2)' };

/* ── shared input ── */
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

function Input({ icon, error, ...props }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      {icon && (
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: focused ? C.primary : '#9ca3af', transition: 'color 0.2s', pointerEvents: 'none',
          display: 'flex',
        }}>{icon}</span>
      )}
      <input
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        style={{
          width: '100%', padding: icon ? '12px 14px 12px 42px' : '12px 14px',
          border: `1.5px solid ${error ? '#fca5a5' : focused ? C.primary : '#e5e7eb'}`,
          borderRadius: 10, fontSize: '0.875rem', color: '#111827',
          background: focused ? '#fafbff' : '#fff',
          outline: 'none', transition: 'all 0.2s ease',
          boxShadow: focused ? `0 0 0 3px ${C.glow}` : '0 1px 3px rgba(0,0,0,0.04)',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

function SelectInput({ icon, error, children, ...props }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      {icon && (
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused ? C.primary : '#9ca3af', pointerEvents: 'none', display: 'flex' }}>
          {icon}
        </span>
      )}
      <select
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: icon ? '12px 36px 12px 42px' : '12px 36px 12px 14px',
          border: `1.5px solid ${focused ? C.primary : '#e5e7eb'}`,
          borderRadius: 10, fontSize: '0.875rem', color: '#111827',
          background: focused ? '#fafbff' : '#fff',
          outline: 'none', transition: 'all 0.2s', appearance: 'none',
          boxShadow: focused ? `0 0 0 3px ${C.glow}` : '0 1px 3px rgba(0,0,0,0.04)',
          fontFamily: 'inherit', cursor: 'pointer',
        }}
      >{children}</select>
      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </span>
    </div>
  );
}

export default function DonorRegisterForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '', address: '', organization: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validateForm = () => {
    const e: FormErrors = {};
    if (!formData.firstName) e.firstName = 'First name is required';
    if (!formData.lastName) e.lastName = 'Last name is required';
    if (!formData.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email';
    if (!formData.phone) e.phone = 'Phone number is required';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'Minimum 6 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!formData.address) e.address = 'Address is required';
    if (!formData.organization) e.organization = 'Organization type is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true); setErrors({});
    try {
      const result = await dispatch(registerUser({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email, password: formData.password, role: 'donor' as const,
        phone: formData.phone, address: formData.address, organization: formData.organization,
      }) as any);
      if (registerUser.fulfilled.match(result)) { alert('Registration successful! Please log in.'); navigate('/login'); }
      else setErrors({ submit: result.payload || 'Registration failed. Please try again.' });
    } catch { setErrors({ submit: 'Network error. Please check your connection.' }); }
    finally { setIsLoading(false); }
  };

  // Progress calculation
  const filled = Object.values(formData).filter(v => v.length > 0).length;
  const total = Object.keys(formData).length;
  const progress = Math.round((filled / total) * 100);

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 60%, #ede9fe 100%)',
      fontFamily: "'DM Sans', system-ui, sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        textarea { font-family: inherit; }
      `}</style>

      {/* Background blobs */}
      <div style={{ position: 'fixed', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle, #3b82f610 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none', opacity: 0.6 }} />

      {/* Back */}

      {/* Main */}
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '72px 20px 48px', animation: 'fadeUp 0.6s ease both' }}>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 8px 40px rgba(59,130,246,0.1), 0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

          {/* Top accent bar */}
          <div style={{ height: 4, background: `linear-gradient(90deg, ${C.primary}, ${C.dark})` }} />

          <div style={{ padding: '36px 36px 40px' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
                background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 24px ${C.glow}`,
                animation: 'float 3s ease-in-out infinite',
              }}>
                <Heart size={28} color="#fff" fill="#fff" />
              </div>
              <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: 6, letterSpacing: '-0.02em' }}>
                Join as Donor
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Help share food with those in need</p>

              {/* Progress bar */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>Profile completion</span>
                  <span style={{ fontSize: '0.7rem', color: C.primary, fontWeight: 700 }}>{progress}%</span>
                </div>
                <div style={{ height: 5, background: '#f3f4f6', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${progress}%`, borderRadius: 99, background: `linear-gradient(90deg, ${C.primary}, ${C.dark})`, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="First Name *" error={errors.firstName}>
                  <Input icon={<User size={15} />} type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" error={errors.firstName} />
                </Field>
                <Field label="Last Name *" error={errors.lastName}>
                  <Input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" error={errors.lastName} />
                </Field>
              </div>

              <Field label="Email Address *" error={errors.email}>
                <Input icon={<Mail size={15} />} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" error={errors.email} />
              </Field>

              <Field label="Phone Number *" error={errors.phone}>
                <Input icon={<Phone size={15} />} type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 123-4567" error={errors.phone} />
              </Field>

              {/* Password row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Password *" error={errors.password}>
                  <div style={{ position: 'relative' }}>
                    <Input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" error={errors.password} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>
                <Field label="Confirm Password *" error={errors.confirmPassword}>
                  <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" error={errors.confirmPassword} />
                </Field>
              </div>

              <Field label="Address *" error={errors.address}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: 13, color: '#9ca3af', pointerEvents: 'none' }}><MapPin size={15} /></span>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} placeholder="123 Main St, City, State 12345" style={{
                    width: '100%', padding: '12px 14px 12px 42px',
                    border: `1.5px solid ${errors.address ? '#fca5a5' : '#e5e7eb'}`, borderRadius: 10,
                    fontSize: '0.875rem', color: '#111827', outline: 'none', resize: 'none',
                    fontFamily: 'inherit', transition: 'all 0.2s', background: '#fff',
                  }}
                    onFocus={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.glow}`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.address ? '#fca5a5' : '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </Field>

              <Field label="Organization Type *" error={errors.organization}>
                <SelectInput icon={<Building size={15} />} name="organization" value={formData.organization} onChange={handleInputChange} error={errors.organization}>
                  {ORGANIZATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </SelectInput>
              </Field>

              {/* Error */}
              {errors.submit && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px' }}>
                  <p style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600, marginBottom: 4 }}>Registration Failed</p>
                  <p style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.submit}</p>
                </div>
              )}

              {/* Submit */}
              <button onClick={handleSubmit} disabled={isLoading} style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                background: isLoading ? '#93c5fd' : `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
                color: '#fff', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit',
                boxShadow: isLoading ? 'none' : `0 4px 20px ${C.glow}`,
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
              >
                {isLoading ? (
                  <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Creating Account...</>
                ) : (
                  <><CheckCircle size={16} /> Create Donor Account</>
                )}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#6b7280' }}>
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.primary, fontWeight: 700, fontFamily: 'inherit', fontSize: '0.82rem' }}>
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20 }}>
          {['🔒 Secure', '✦ Free Forever', '🌱 Zero Waste'].map(b => (
            <span key={b} style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600 }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}