import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Camera, Users, Clock, MapPin, AlertCircle,
    Info, CheckCircle, ChevronRight, X, Utensils,
    FileText, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { foodDonationService } from '../../services/foodDonationService';
import type { CreateFoodDonationRequest } from '../../types/foodListing';
import { showNotification } from '../../utils/notificationUtils';
import LocationPicker from '../maps/LocationPicker';

/* ─── Types ─── */
interface FormData {
    foodType: string; servings: string; description: string;
    bestBefore: string; bestBeforeHours: string; bestBeforeMinutes: string;
    allergens: string[]; pickupInstructions: string; location: any;
}

const STEPS = [
    { id: 1, label: 'Photo',     icon: Camera },
    { id: 2, label: 'Details',   icon: Utensils },
    { id: 3, label: 'Logistics', icon: MapPin },
    { id: 4, label: 'Review',    icon: CheckCircle },
];

const FOOD_CATEGORIES = [
    { value: 'main-course', label: '🍛 Main Course' },
    { value: 'appetizer',   label: '🥗 Appetizer' },
    { value: 'dessert',     label: '🍰 Dessert' },
    { value: 'beverages',   label: '☕ Beverages' },
    { value: 'snacks',      label: '🍿 Snacks' },
    { value: 'fruits',      label: '🍎 Fruits' },
    { value: 'vegetables',  label: '🥦 Vegetables' },
    { value: 'baked-goods', label: '🍞 Baked Goods' },
    { value: 'dairy',       label: '🧀 Dairy' },
    { value: 'other',       label: '🥡 Other' },
];

const ALLERGEN_OPTIONS = [
    { label: 'Gluten',  emoji: '🌾' }, { label: 'Dairy',   emoji: '🥛' },
    { label: 'Nuts',    emoji: '🥜' }, { label: 'Eggs',    emoji: '🥚' },
    { label: 'Soy',     emoji: '🫘' }, { label: 'Spicy',   emoji: '🌶️' },
    { label: 'Seafood', emoji: '🦐' }, { label: 'Sesame',  emoji: '🌿' },
];

const QUICK_TIMES = [
    { label: '1h',  hours: 1,  mins: 0 }, { label: '2h',  hours: 2,  mins: 0 },
    { label: '4h',  hours: 4,  mins: 0 }, { label: '6h',  hours: 6,  mins: 0 },
    { label: '12h', hours: 12, mins: 0 }, { label: '24h', hours: 24, mins: 0 },
];

/* ─── Input style helper ─── */
const inp = (err: boolean, extra: React.CSSProperties = {}): React.CSSProperties => ({
    width: '100%', padding: '11px 14px', border: `1.5px solid ${err ? '#fca5a5' : '#e5e7eb'}`,
    borderRadius: 12, fontSize: '0.875rem', color: '#111827',
    background: err ? '#fff5f5' : '#f9fafb', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: 'inherit',
    boxSizing: 'border-box', ...extra,
});

function Field({ label, required, error, children }: {
    label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            {children}
            {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                    <AlertCircle size={12} color="#ef4444" />
                    <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{error}</span>
                </div>
            )}
        </div>
    );
}

function SectionHeader({ icon: Icon, gradient, title, sub }: {
    icon: React.ElementType; gradient: string; title: string; sub: string;
}) {
    const shadow = gradient.includes('22c55e') ? 'rgba(34,197,94,0.3)'
        : gradient.includes('f97316') ? 'rgba(249,115,22,0.3)'
        : gradient.includes('a855f7') ? 'rgba(168,85,247,0.3)'
        : 'rgba(59,130,246,0.3)';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 6px 16px ${shadow}` }}>
                <Icon size={20} color="#fff" />
            </div>
            <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Playfair Display',serif" }}>{title}</h2>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>{sub}</p>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
export default function AddSurplusFood() {
    const navigate = useNavigate();
    const [step, setStep]               = useState(1);
    const [formData, setFormData]       = useState<FormData>({
        foodType: '', servings: '', description: '', bestBefore: '',
        bestBeforeHours: '', bestBeforeMinutes: '', allergens: [],
        pickupInstructions: '', location: null,
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting]   = useState(false);
    const [errors, setErrors]               = useState<Record<string, string>>({});
    const [showLocationHelp, setShowLocationHelp] = useState(false);
    const [submitted, setSubmitted]         = useState(false);

    const set = (field: keyof FormData, value: any) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    const toggleAllergen = (a: string) =>
        set('allergens', formData.allergens.includes(a)
            ? formData.allergens.filter(x => x !== a)
            : [...formData.allergens, a]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => { if (typeof ev.target?.result === 'string') setSelectedImage(ev.target.result); };
        reader.readAsDataURL(file);
    };

    const validateStep = (s: number): Record<string, string> => {
        const e: Record<string, string> = {};
        if (s === 2) {
            if (!formData.foodType)    e.foodType    = 'Please select a food type';
            if (!formData.servings)    e.servings    = 'Servings is required';
            if (!formData.description) e.description = 'Description is required';
        }
        if (s === 3) {
            const h = parseInt(formData.bestBeforeHours)   || 0;
            const m = parseInt(formData.bestBeforeMinutes) || 0;
            if (h === 0 && m === 0) e.bestBefore = 'Best before time must be greater than 0';
            if (!formData.location?.coordinates) e.location = 'Pickup location is required';
        }
        return e;
    };

    const goNext = () => {
        const e = validateStep(step);
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setErrors({});
        setStep(s => Math.min(s + 1, 4));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goBack = () => {
        if (step === 1) navigate('/donor-dashboard');
        else { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    };

    const handleSubmit = async () => {
        const e = validateStep(3);
        if (Object.keys(e).length > 0) { setErrors(e); setStep(3); return; }
        setIsSubmitting(true);
        try {
            const hours   = parseInt(formData.bestBeforeHours)   || 0;
            const minutes = parseInt(formData.bestBeforeMinutes) || 0;
            const bestBefore = (hours + minutes / 60).toString();

            let locationData = formData.location;
            if (locationData?.coordinates && typeof locationData.coordinates === 'object' && 'lat' in locationData.coordinates) {
                locationData = { ...locationData, coordinates: [locationData.coordinates.lng, locationData.coordinates.lat] };
            }

            const payload: CreateFoodDonationRequest = {
                foodType: formData.foodType, servings: formData.servings,
                description: formData.description, bestBefore,
                allergens: formData.allergens,
                pickupInstructions: formData.pickupInstructions || 'Contact for pickup details',
                location: locationData,
            };
            if (selectedImage?.startsWith('data:image') && selectedImage.length <= 7_000_000)
                payload.image = selectedImage;

            await foodDonationService.create(payload);
            setSubmitted(true);
            setTimeout(() => navigate('/donor-dashboard'), 2200);
        } catch (err: any) {
            showNotification.error(err.response?.data?.message || err.message || 'Failed to submit');
        } finally {
            setIsSubmitting(false);
        }
    };

    const progress = ((step - 1) / (STEPS.length - 1)) * 100;

    /* ── Success screen ── */
    if (submitted) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f0fdf4,#eff6ff)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
            <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}`}</style>
            <div style={{ textAlign: 'center', padding: 40, animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 12px 36px rgba(34,197,94,0.35)' }}>
                    <CheckCircle size={40} color="#fff" />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Listing Posted! 🎉</h2>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Redirecting to your dashboard…</p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg,#f0fdf4,#f8fafc,#eff6ff)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');
                @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                @keyframes spin    { to{transform:rotate(360deg)} }
                input:focus,select:focus,textarea:focus { border-color:#22c55e !important; box-shadow:0 0 0 3px rgba(34,197,94,0.12) !important; background:#fff !important; outline:none; }
                *{box-sizing:border-box;}
            `}</style>

            {/* ── Sticky header ── */}
            <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 40 }}>
                <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <button onClick={goBack} style={{ width: 36, height: 36, borderRadius: 11, background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowLeft size={16} color="#374151" />
                    </button>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Playfair Display',serif" }}>Add Surplus Food</h1>
                        <p style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Share your surplus with those in need</p>
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 99, padding: '4px 12px' }}>
                        Step {step} / {STEPS.length}
                    </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: 3, background: '#e5e7eb' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#22c55e,#3b82f6)', borderRadius: '0 99px 99px 0', transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)' }} />
                </div>
            </div>

            {/* ── Step pills ── */}
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '18px 24px 0', display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {STEPS.map(s => {
                    const done = step > s.id, active = step === s.id;
                    const Icon = s.icon;
                    return (
                        <div key={s.id} onClick={() => done && setStep(s.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: active ? 'linear-gradient(135deg,#22c55e,#15803d)' : done ? '#f0fdf4' : '#f1f5f9', border: `1.5px solid ${active ? 'transparent' : done ? '#bbf7d0' : '#e5e7eb'}`, cursor: done ? 'pointer' : 'default', transition: 'all 0.3s' }}>
                            <Icon size={12} color={active ? '#fff' : done ? '#16a34a' : '#94a3b8'} />
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: active ? '#fff' : done ? '#16a34a' : '#94a3b8' }}>{s.label}</span>
                            {done && <CheckCircle size={10} color="#16a34a" />}
                        </div>
                    );
                })}
            </div>

            {/* ── Content ── */}
            <div style={{ maxWidth: 760, margin: '18px auto 120px', padding: '0 24px' }}>
                <div key={step} style={{ background: '#fff', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden', animation: 'fadeUp 0.35s ease both' }}>

                    {/* ══ STEP 1 — Photo ══ */}
                    {step === 1 && (
                        <div style={{ padding: '32px' }}>
                            <SectionHeader icon={Camera} gradient="linear-gradient(135deg,#3b82f6,#1d4ed8)" title="Food Photo" sub="A great photo gets 3× more pickups" />
                            <div style={{ marginTop: 22 }}>
                                {selectedImage ? (
                                    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '2px solid #bbf7d0' }}>
                                        <img src={selectedImage} alt="Preview" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} />
                                        <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <X size={14} color="#fff" />
                                        </button>
                                        <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(34,197,94,0.88)', borderRadius: 99, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <CheckCircle size={11} color="#fff" /><span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 700 }}>Photo added</span>
                                        </div>
                                    </div>
                                ) : (
                                    <label style={{ display: 'block', cursor: 'pointer' }}>
                                        <div style={{ border: '2px dashed #d1d5db', borderRadius: 16, padding: '52px 24px', textAlign: 'center', background: '#fafafa', transition: 'all 0.2s' }}
                                            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#22c55e'; el.style.background = '#f0fdf4'; }}
                                            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#d1d5db'; el.style.background = '#fafafa'; }}>
                                            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 6px 20px rgba(59,130,246,0.3)' }}>
                                                <Camera size={26} color="#fff" />
                                            </div>
                                            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151', marginBottom: 5 }}>Click to upload a photo</p>
                                            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>JPG, PNG — up to 10MB</p>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                    </label>
                                )}
                            </div>
                            <div style={{ marginTop: 18, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '11px 15px', display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                                <Info size={13} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                                <p style={{ fontSize: '0.74rem', color: '#166534', lineHeight: 1.6 }}>Photo is optional — you can skip and add one later from the listing.</p>
                            </div>
                        </div>
                    )}

                    {/* ══ STEP 2 — Details ══ */}
                    {step === 2 && (
                        <div style={{ padding: '32px' }}>
                            <SectionHeader icon={Utensils} gradient="linear-gradient(135deg,#22c55e,#15803d)" title="Food Details" sub="Tell recipients what you're sharing" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 24 }}>

                                <Field label="Food Type" required error={errors.foodType}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10, marginTop: 4 }}>
                                        {FOOD_CATEGORIES.map(cat => (
                                            <button key={cat.value} type="button" onClick={() => { set('foodType', cat.value); setErrors(p => ({ ...p, foodType: '' })); }}
                                                style={{ padding: '10px 12px', borderRadius: 12, border: `2px solid ${formData.foodType === cat.value ? '#22c55e' : '#e5e7eb'}`, background: formData.foodType === cat.value ? '#f0fdf4' : '#f9fafb', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: formData.foodType === cat.value ? '#15803d' : '#374151', transition: 'all 0.18s', textAlign: 'center', fontFamily: 'inherit' }}>
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </Field>

                                <Field label="Number of Servings" required error={errors.servings}>
                                    <div style={{ position: 'relative' }}>
                                        <Users size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                                        <input type="number" min="1" placeholder="e.g. 25" value={formData.servings}
                                            onChange={e => { set('servings', e.target.value); setErrors(p => ({ ...p, servings: '' })); }}
                                            style={{ ...inp(!!errors.servings), paddingLeft: 38 }} />
                                    </div>
                                </Field>

                                <Field label="Description" required error={errors.description}>
                                    <textarea placeholder="Describe the food — ingredients, how it was prepared, portion size…"
                                        value={formData.description} rows={3}
                                        onChange={e => { set('description', e.target.value); setErrors(p => ({ ...p, description: '' })); }}
                                        style={{ ...inp(!!errors.description), resize: 'none', paddingTop: 11 }} />
                                    <div style={{ textAlign: 'right', fontSize: '0.67rem', color: '#9ca3af', marginTop: 3 }}>{formData.description.length} chars</div>
                                </Field>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                                        Allergens <span style={{ fontWeight: 400, color: '#9ca3af' }}>(select all that apply)</span>
                                    </label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {ALLERGEN_OPTIONS.map(a => {
                                            const on = formData.allergens.includes(a.label);
                                            return (
                                                <button key={a.label} type="button" onClick={() => toggleAllergen(a.label)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 99, border: `1.5px solid ${on ? '#fca5a5' : '#e5e7eb'}`, background: on ? '#fef2f2' : '#f9fafb', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: on ? '#dc2626' : '#6b7280', transition: 'all 0.18s', fontFamily: 'inherit' }}>
                                                    {a.emoji} {a.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ STEP 3 — Logistics ══ */}
                    {step === 3 && (
                        <div style={{ padding: '32px' }}>
                            <SectionHeader icon={MapPin} gradient="linear-gradient(135deg,#f97316,#c2410c)" title="Pickup Logistics" sub="When and where can food be collected?" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24 }}>

                                <Field label="Best Before (time from now)" required error={errors.bestBefore}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                        {QUICK_TIMES.map(qt => {
                                            const on = parseInt(formData.bestBeforeHours || '0') === qt.hours && parseInt(formData.bestBeforeMinutes || '0') === qt.mins;
                                            return (
                                                <button key={qt.label} type="button"
                                                    onClick={() => { set('bestBeforeHours', qt.hours.toString()); set('bestBeforeMinutes', qt.mins.toString()); setErrors(p => ({ ...p, bestBefore: '' })); }}
                                                    style={{ padding: '6px 15px', borderRadius: 99, border: `1.5px solid ${on ? '#22c55e' : '#e5e7eb'}`, background: on ? '#f0fdf4' : '#f9fafb', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: on ? '#15803d' : '#6b7280', transition: 'all 0.18s', fontFamily: 'inherit' }}>
                                                    ⚡ {qt.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <Clock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                                            <input type="number" min="0" placeholder="Hours" value={formData.bestBeforeHours}
                                                onChange={e => { set('bestBeforeHours', e.target.value); setErrors(p => ({ ...p, bestBefore: '' })); }}
                                                style={{ ...inp(!!errors.bestBefore), paddingLeft: 36 }} />
                                            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: '#9ca3af', pointerEvents: 'none' }}>hrs</span>
                                        </div>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <input type="number" min="0" max="59" placeholder="Minutes" value={formData.bestBeforeMinutes}
                                                onChange={e => { set('bestBeforeMinutes', e.target.value); setErrors(p => ({ ...p, bestBefore: '' })); }}
                                                style={inp(!!errors.bestBefore)} />
                                            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: '#9ca3af', pointerEvents: 'none' }}>mins</span>
                                        </div>
                                    </div>
                                </Field>

                                <Field label="Pickup Location" required error={errors.location}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Select a precise pickup point</span>
                                        <button type="button" onClick={() => setShowLocationHelp(v => !v)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                                            <Info size={12} /> {showLocationHelp ? 'Hide' : 'Tips'}
                                        </button>
                                    </div>
                                    {showLocationHelp && (
                                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: '0.75rem', color: '#1e40af', lineHeight: 1.7 }}>
                                            💡 Search your address, click "Use current location" for GPS, or drag the pin to adjust.
                                        </div>
                                    )}
                                    <LocationPicker
                                        onLocationSelect={(loc: any) => { set('location', loc); setErrors(p => ({ ...p, location: '' })); }}
                                        required showMap
                                    />
                                </Field>

                                <Field label="Pickup Instructions">
                                    <textarea placeholder="e.g. Ring the doorbell at Gate 2, ask for Priya…"
                                        value={formData.pickupInstructions} rows={3}
                                        onChange={e => set('pickupInstructions', e.target.value)}
                                        style={{ ...inp(false), resize: 'none', paddingTop: 11 }} />
                                </Field>
                            </div>
                        </div>
                    )}

                    {/* ══ STEP 4 — Review ══ */}
                    {step === 4 && (
                        <div style={{ padding: '32px' }}>
                            <SectionHeader icon={CheckCircle} gradient="linear-gradient(135deg,#a855f7,#6d28d9)" title="Review & Post" sub="Everything look good? Post your listing!" />
                            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>

                                {selectedImage && (
                                    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                        <img src={selectedImage} alt="Food" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                                    </div>
                                )}

                                <div style={{ background: '#f8fafc', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                    {[
                                        { label: 'Food Type',   value: FOOD_CATEGORIES.find(c => c.value === formData.foodType)?.label || formData.foodType, icon: Utensils },
                                        { label: 'Servings',    value: `${formData.servings} servings`, icon: Users },
                                        { label: 'Best Before', value: `${formData.bestBeforeHours || 0}h ${formData.bestBeforeMinutes || 0}m from now`, icon: Clock },
                                        { label: 'Location',    value: formData.location?.address || 'Location selected ✓', icon: MapPin },
                                        { label: 'Description', value: formData.description, icon: FileText },
                                        ...(formData.allergens.length > 0 ? [{ label: 'Allergens', value: formData.allergens.join(', '), icon: AlertCircle }] : []),
                                        ...(formData.pickupInstructions ? [{ label: 'Pickup notes', value: formData.pickupInstructions, icon: Info }] : []),
                                    ].map((row, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                                <row.icon size={13} color="#6b7280" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.67rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{row.label}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 500 }}>{row.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {[1, 2, 3].map(s => (
                                        <button key={s} type="button" onClick={() => setStep(s)}
                                            style={{ padding: '6px 14px', borderRadius: 99, background: '#f1f5f9', border: '1px solid #e5e7eb', fontSize: '0.72rem', fontWeight: 600, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e2e8f0'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}>
                                            ✏️ Edit {STEPS[s - 1].label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bottom nav ── */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', borderTop: '1px solid #e5e7eb', padding: '14px 24px', zIndex: 40 }}>
                <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', gap: 12 }}>
                    {step > 1 && (
                        <button onClick={goBack} style={{ flex: '0 0 auto', padding: '13px 20px', borderRadius: 14, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ArrowLeft size={14} /> Back
                        </button>
                    )}
                    <button onClick={step === 4 ? handleSubmit : goNext} disabled={isSubmitting}
                        style={{ flex: 1, padding: '14px 24px', borderRadius: 14, border: 'none', background: step === 4 ? 'linear-gradient(135deg,#22c55e,#15803d)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: step === 4 ? '0 6px 20px rgba(34,197,94,0.35)' : '0 6px 20px rgba(59,130,246,0.35)', opacity: isSubmitting ? 0.7 : 1 }}>
                        {isSubmitting
                            ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} /> Posting…</>
                            : step === 4
                            ? <><Zap size={16} /> Post Listing Now</>
                            : <>Continue <ChevronRight size={16} /></>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}