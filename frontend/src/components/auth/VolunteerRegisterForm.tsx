import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, HandHeart, Eye, EyeOff, CheckCircle, Clock, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../store/authSlice';

type FormData = {
  firstName: string; lastName: string; email: string; phone: string;
  password: string; confirmPassword: string; address: string;
  organization: string; availability: string[]; hasVehicle: boolean; experience: string;
};
type FormErrors = Partial<Record<keyof Omit<FormData,'availability'|'hasVehicle'> | 'availability' | 'submit', string>>;

const C = { primary: '#9333ea', light: '#faf5ff', mid: '#e9d5ff', dark: '#6b21a8', glow: 'rgba(147,51,234,0.18)' };

const SLOTS = ['Mon Morning','Mon Evening','Tue Morning','Tue Evening','Wed Morning','Wed Evening','Thu Morning','Thu Evening','Fri Morning','Fri Evening','Saturday','Sunday'];

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.04em' }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 4 }}>⚠ {error}</p>}
    </div>
  );
}

function Input({ icon, error, ...props }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused ? C.primary : '#9ca3af', transition: 'color 0.2s', pointerEvents: 'none', display: 'flex' }}>{icon}</span>}
      <input {...props}
        onFocus={(e: any) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e: any) => { setFocused(false); props.onBlur?.(e); }}
        style={{
          width: '100%', padding: icon ? '12px 14px 12px 42px' : '12px 14px',
          border: `1.5px solid ${error ? '#fca5a5' : focused ? C.primary : '#e5e7eb'}`,
          borderRadius: 10, fontSize: '0.875rem', color: '#111827',
          background: focused ? C.light : '#fff', outline: 'none',
          transition: 'all 0.2s', boxShadow: focused ? `0 0 0 3px ${C.glow}` : '0 1px 3px rgba(0,0,0,0.04)',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

function SelectInput({ children, ...props }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <select {...props} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{
        width: '100%', padding: '12px 36px 12px 14px',
        border: `1.5px solid ${focused ? C.primary : '#e5e7eb'}`, borderRadius: 10,
        fontSize: '0.875rem', color: '#111827', background: focused ? C.light : '#fff',
        outline: 'none', appearance: 'none', transition: 'all 0.2s',
        boxShadow: focused ? `0 0 0 3px ${C.glow}` : '0 1px 3px rgba(0,0,0,0.04)',
        fontFamily: 'inherit', cursor: 'pointer',
      }}>{children}</select>
      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
      </span>
    </div>
  );
}

export default function VolunteerRegisterForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '', address: '', organization: '',
    availability: [], hasVehicle: false, experience: 'beginner',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name as keyof FormErrors]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const toggleSlot = (slot: string) => {
    setFormData(p => ({
      ...p,
      availability: p.availability.includes(slot)
        ? p.availability.filter(s => s !== slot)
        : [...p.availability, slot],
    }));
    if (errors.availability) setErrors(p => ({ ...p, availability: '' }));
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
    if (formData.availability.length === 0) e.availability = 'Select at least one time slot';
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
        email: formData.email, password: formData.password, role: 'volunteer' as const,
        phone: formData.phone, address: formData.address, organization: formData.organization,
        availability: formData.availability, hasVehicle: formData.hasVehicle, experience: formData.experience,
      } as any) as any);
      if (registerUser.fulfilled.match(result)) { alert('Registration successful! Please log in.'); navigate('/login'); }
      else setErrors({ submit: result.payload || 'Registration failed. Please try again.' });
    } catch { setErrors({ submit: 'Network error. Please try again.' }); }
    finally { setIsLoading(false); }
  };

  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword', 'address'];
  const filled = requiredFields.filter(k => (formData as any)[k]?.length > 0).length
    + (formData.availability.length > 0 ? 1 : 0);
  const progress = Math.round((filled / (requiredFields.length + 1)) * 100);

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #faf5ff 0%, #f8fafc 60%, #ede9fe 100%)',
      fontFamily: "'DM Sans', system-ui, sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        * { box-sizing: border-box; } textarea { font-family: inherit; }
      `}</style>

      <div style={{ position: 'fixed', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(147,51,234,0.1), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle, #9333ea10 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none', opacity: 0.7 }} />

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '72px 20px 48px', animation: 'fadeUp 0.6s ease both' }}>
        <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 8px 40px rgba(147,51,234,0.1), 0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ height: 4, background: `linear-gradient(90deg, ${C.primary}, #6366f1)` }} />
          <div style={{ padding: '36px 36px 40px' }}>

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
                background: `linear-gradient(135deg, ${C.primary}, #6366f1)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 24px ${C.glow}`, animation: 'float 3s ease-in-out infinite',
              }}>
                <HandHeart size={28} color="#fff" />
              </div>
              <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: 6, letterSpacing: '-0.02em' }}>
                Join as Volunteer
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Help deliver food to those in need</p>
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>Profile completion</span>
                  <span style={{ fontSize: '0.7rem', color: C.primary, fontWeight: 700 }}>{progress}%</span>
                </div>
                <div style={{ height: 5, background: '#f3f4f6', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${progress}%`, borderRadius: 99, background: `linear-gradient(90deg, ${C.primary}, #6366f1)`, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                    width: '100%', padding: '12px 14px 12px 42px', border: `1.5px solid ${errors.address ? '#fca5a5' : '#e5e7eb'}`,
                    borderRadius: 10, fontSize: '0.875rem', color: '#111827', outline: 'none', resize: 'none',
                    fontFamily: 'inherit', transition: 'all 0.2s', background: '#fff',
                  }}
                    onFocus={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.glow}`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.address ? '#fca5a5' : '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Experience Level">
                  <SelectInput name="experience" value={formData.experience} onChange={handleInputChange}>
                    <option value="beginner">New volunteer</option>
                    <option value="some">Some experience</option>
                    <option value="experienced">Very experienced</option>
                  </SelectInput>
                </Field>

                {/* Vehicle toggle */}
                <Field label="Transportation">
                  <div
                    onClick={() => setFormData(p => ({ ...p, hasVehicle: !p.hasVehicle }))}
                    style={{
                      padding: '11px 14px', borderRadius: 10, cursor: 'pointer',
                      border: `1.5px solid ${formData.hasVehicle ? C.primary : '#e5e7eb'}`,
                      background: formData.hasVehicle ? C.light : '#fff',
                      display: 'flex', alignItems: 'center', gap: 10,
                      transition: 'all 0.2s', userSelect: 'none',
                    }}>
                    <div style={{
                      width: 36, height: 20, borderRadius: 10, position: 'relative',
                      background: formData.hasVehicle ? C.primary : '#d1d5db',
                      transition: 'background 0.2s', flexShrink: 0,
                    }}>
                      <div style={{
                        position: 'absolute', top: 2, left: formData.hasVehicle ? 18 : 2,
                        width: 16, height: 16, borderRadius: '50%', background: '#fff',
                        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Car size={14} color={formData.hasVehicle ? C.primary : '#9ca3af'} />
                      <span style={{ fontSize: '0.8rem', color: formData.hasVehicle ? C.primary : '#6b7280', fontWeight: 600 }}>
                        {formData.hasVehicle ? 'Has vehicle' : 'No vehicle'}
                      </span>
                    </div>
                  </div>
                </Field>
              </div>

              {/* Availability grid */}
              <Field label="Availability *" error={errors.availability}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {SLOTS.map(slot => {
                    const sel = formData.availability.includes(slot);
                    return (
                      <div key={slot} onClick={() => toggleSlot(slot)} style={{
                        padding: '8px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                        border: `1.5px solid ${sel ? C.primary : '#e5e7eb'}`,
                        background: sel ? C.light : '#fff',
                        fontSize: '0.72rem', fontWeight: sel ? 700 : 500,
                        color: sel ? C.primary : '#6b7280',
                        transition: 'all 0.18s', userSelect: 'none',
                        boxShadow: sel ? `0 0 0 2px ${C.glow}` : 'none',
                      }}>{slot}</div>
                    );
                  })}
                </div>
                {formData.availability.length > 0 && (
                  <p style={{ fontSize: '0.72rem', color: C.primary, marginTop: 6, fontWeight: 600 }}>
                    ✓ {formData.availability.length} slot{formData.availability.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </Field>

              <Field label="Organization (Optional)">
                <Input type="text" name="organization" value={formData.organization} onChange={handleInputChange} placeholder="Company, School, NGO, etc." />
              </Field>

              {errors.submit && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px' }}>
                  <p style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>Registration Failed</p>
                  <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 4 }}>{errors.submit}</p>
                </div>
              )}

              <button onClick={handleSubmit} disabled={isLoading} style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                background: isLoading ? '#d8b4fe' : `linear-gradient(135deg, ${C.primary}, #6366f1)`,
                color: '#fff', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit',
                boxShadow: isLoading ? 'none' : `0 4px 20px ${C.glow}`,
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
              >
                {isLoading
                  ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Creating Account...</>
                  : <><CheckCircle size={16} />Create Volunteer Account</>}
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20 }}>
          {['🔒 Secure', '✦ Free Forever', '🌱 Zero Waste'].map(b => (
            <span key={b} style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600 }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}