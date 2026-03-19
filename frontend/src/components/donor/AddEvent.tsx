import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, MapPin, Clock, Camera,
    CheckCircle, AlertCircle, Package, Info,
    Utensils, Timer, FileText, Building, ChevronDown, X, Zap
} from 'lucide-react';
import { foodDonationService } from '../../services/foodDonationService';
import type { CreateFoodDonationRequest } from '../../types/foodListing';
import { showNotification } from '../../utils/notificationUtils';
import LocationPicker from '../maps/LocationPicker';

/* ── Freshness → bestBefore hours mapping ── */
const FRESHNESS_MAP: Record<string, number> = {
    'Excellent - Just prepared':   6,
    'Good - Within 2 hours':       4,
    'Fair - Within 4 hours':       2,
    'Best consumed soon':          1,
};

const FOOD_TYPES = [
    'Prepared Meals', 'Fresh Fruits & Vegetables', 'Baked Goods',
    'Dairy Products', 'Beverages', 'Packaged Foods', 'Desserts', 'Other'
];
const FRESHNESS_OPTIONS = Object.keys(FRESHNESS_MAP);
const ALLERGEN_OPTIONS  = ['Gluten','Dairy','Nuts','Eggs','Soy','Spicy','Seafood','Sesame'];

function Field({ label, required, error, children }: { label:string; required?:boolean; error?:string; children:React.ReactNode }) {
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <label style={{ fontSize:'0.82rem', fontWeight:700, color:'#374151', display:'flex', alignItems:'center', gap:6 }}>
                {label} {required && <span style={{ color:'#ef4444' }}>*</span>}
            </label>
            {children}
            {error && <p style={{ fontSize:'0.72rem', color:'#ef4444', display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={11}/> {error}</p>}
        </div>
    );
}

const inp: React.CSSProperties = {
    width:'100%', padding:'11px 14px', border:'1.5px solid #e5e7eb', borderRadius:12,
    fontSize:'0.875rem', color:'#111827', background:'#f9fafb', outline:'none',
    fontFamily:'inherit', boxSizing:'border-box', transition:'border-color 0.2s, box-shadow 0.2s',
};

export default function ListEventFood() {
    const navigate = useNavigate();
    const fileRef  = useRef<HTMLInputElement>(null);

    const [foodType,       setFoodType]       = useState('');
    const [servings,       setServings]       = useState('');
    const [freshness,      setFreshness]      = useState('');
    const [description,    setDescription]    = useState('');
    const [allergens,      setAllergens]      = useState<string[]>([]);
    const [pickupDetails,  setPickupDetails]  = useState('');
    const [location,       setLocation]       = useState<any>(null);
    const [image,          setImage]          = useState<string|null>(null);
    const [isSubmitting,   setIsSubmitting]   = useState(false);
    const [submitted,      setSubmitted]      = useState(false);
    const [errors,         setErrors]         = useState<Record<string,string>>({});

    const toggleAllergen = (a: string) =>
        setAllergens(prev => prev.includes(a) ? prev.filter(x=>x!==a) : [...prev, a]);

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => { if (typeof ev.target?.result === 'string') setImage(ev.target.result); };
        reader.readAsDataURL(file);
    };

    const validate = () => {
        const e: Record<string,string> = {};
        if (!foodType)  e.foodType  = 'Please select a food type';
        if (!servings)  e.servings  = 'Please enter estimated servings';
        if (!freshness) e.freshness = 'Please select freshness status';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const bestBeforeHours = FRESHNESS_MAP[freshness] || 4;

            /* Normalize location */
            let locationData = location;
            if (locationData?.coordinates && typeof locationData.coordinates === 'object' && 'lat' in locationData.coordinates) {
                locationData = { ...locationData, coordinates: [locationData.coordinates.lng, locationData.coordinates.lat] };
            }

            const payload: CreateFoodDonationRequest = {
                foodType,
                servings,
                description: description || `Event food: ${foodType}`,
                bestBefore: String(bestBeforeHours),
                allergens,
                pickupInstructions: pickupDetails || 'Contact for pickup details',
                location: locationData || undefined,
                image: image && image.length <= 7_000_000 ? image : undefined,
            };

            await foodDonationService.create(payload);
            setSubmitted(true);
            setTimeout(() => navigate('/donor-dashboard'), 2200);
        } catch (err: any) {
            showNotification.error(err?.response?.data?.message || 'Failed to submit. Try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const CSS = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.8)}       to{opacity:1;transform:scale(1)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        * { box-sizing:border-box; }
        input:focus, select:focus, textarea:focus { border-color:#22c55e !important; box-shadow:0 0 0 3px rgba(34,197,94,0.12) !important; background:#fff !important; outline:none; }
    `;

    /* ── Success screen ── */
    if (submitted) return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#f0fdf4,#eff6ff)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}`}</style>
            <div style={{ textAlign:'center', animation:'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 12px 36px rgba(34,197,94,0.35)' }}>
                    <CheckCircle size={40} color="#fff"/>
                </div>
                <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'#0f172a', marginBottom:8 }}>Food Listed! 🎉</h2>
                <p style={{ fontSize:'0.9rem', color:'#64748b' }}>Recipients can see it now. Redirecting…</p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#f0fdf4,#f8fafc,#eff6ff)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            <style>{CSS}</style>

            {/* ── Sticky Header ── */}
            <div style={{ background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(0,0,0,0.06)', position:'sticky', top:0, zIndex:40 }}>
                <div style={{ maxWidth:760, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', gap:14 }}>
                    <button onClick={() => navigate('/donor-dashboard')} style={{ width:36, height:36, borderRadius:11, background:'#f1f5f9', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <ArrowLeft size={16} color="#374151"/>
                    </button>
                    <div style={{ flex:1 }}>
                        <h1 style={{ fontSize:'1rem', fontWeight:800, color:'#0f172a', fontFamily:"'Playfair Display',serif" }}>List Event Food</h1>
                        <p style={{ fontSize:'0.68rem', color:'#94a3b8' }}>Quick listing for event surplus</p>
                    </div>
                    <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#22c55e', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:99, padding:'4px 12px' }}>
                        Event Listing
                    </div>
                </div>
            </div>

            <div style={{ maxWidth:760, margin:'0 auto', padding:'24px 24px 100px', display:'flex', flexDirection:'column', gap:16 }}>

                {/* Event info card */}
                <div style={{ background:'#fff', borderRadius:20, border:'1px solid #f1f5f9', padding:'20px 24px', display:'flex', alignItems:'center', gap:16, boxShadow:'0 2px 14px rgba(0,0,0,0.04)', animation:'fadeUp 0.4s ease both' }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#22c55e,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 14px rgba(34,197,94,0.35)' }}>
                        <Calendar size={22} color="#fff"/>
                    </div>
                    <div style={{ flex:1 }}>
                        <h2 style={{ fontSize:'1rem', fontWeight:700, color:'#0f172a', marginBottom:4 }}>Event Food Listing</h2>
                        <p style={{ fontSize:'0.78rem', color:'#64748b' }}>This listing will be posted to all recipients immediately upon submission</p>
                    </div>
                    <div style={{ padding:'4px 12px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:99, fontSize:'0.7rem', fontWeight:700, color:'#1d4ed8', whiteSpace:'nowrap' }}>
                        Live on submit
                    </div>
                </div>

                {/* ── Food Details ── */}
                <div style={{ background:'#fff', borderRadius:20, border:'1px solid #f1f5f9', overflow:'hidden', boxShadow:'0 2px 14px rgba(0,0,0,0.04)', animation:'fadeUp 0.4s ease 0.06s both', opacity:0 }}>
                    <div style={{ padding:'16px 24px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#22c55e,#15803d)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <Utensils size={15} color="#fff"/>
                        </div>
                        <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#0f172a' }}>Food Details</h3>
                    </div>
                    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:18 }}>

                        <Field label="Food Type" required error={errors.foodType}>
                            <div style={{ position:'relative' }}>
                                <select value={foodType} onChange={e => { setFoodType(e.target.value); setErrors(p=>({...p,foodType:''})); }} style={{ ...inp, paddingRight:36, appearance:'none' }}>
                                    <option value="">Select food type…</option>
                                    {FOOD_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                                <ChevronDown size={14} color="#9ca3af" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                            </div>
                        </Field>

                        <Field label="Estimated Servings" required error={errors.servings}>
                            <div style={{ position:'relative' }}>
                                <Package size={14} color="#9ca3af" style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                                <input type="number" min="1" placeholder="e.g. 25" value={servings}
                                    onChange={e => { setServings(e.target.value); setErrors(p=>({...p,servings:''})); }}
                                    style={{ ...inp, paddingLeft:36 }}/>
                            </div>
                            <p style={{ fontSize:'0.7rem', color:'#9ca3af' }}>Number of people this can serve</p>
                        </Field>

                        <Field label="Freshness Status" required error={errors.freshness}>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                                {FRESHNESS_OPTIONS.map(opt => (
                                    <button key={opt} type="button" onClick={() => { setFreshness(opt); setErrors(p=>({...p,freshness:''})); }}
                                        style={{ padding:'10px 12px', borderRadius:12, border:`2px solid ${freshness===opt?'#22c55e':'#e5e7eb'}`, background:freshness===opt?'#f0fdf4':'#f9fafb', cursor:'pointer', fontSize:'0.78rem', fontWeight:600, color:freshness===opt?'#15803d':'#374151', textAlign:'left', transition:'all 0.18s', fontFamily:'inherit' }}>
                                        <div style={{ fontWeight:700, marginBottom:2 }}>{opt.split(' - ')[0]}</div>
                                        <div style={{ fontSize:'0.68rem', color:freshness===opt?'#16a34a':'#9ca3af' }}>{opt.split(' - ')[1] || opt}</div>
                                    </button>
                                ))}
                            </div>
                        </Field>

                        <Field label="Description">
                            <textarea placeholder="Describe the food — what it is, how it was prepared…" value={description}
                                onChange={e => setDescription(e.target.value)} rows={3}
                                style={{ ...inp, resize:'none', paddingTop:11 }}/>
                        </Field>

                        <Field label="Allergens">
                            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                                {ALLERGEN_OPTIONS.map(a => {
                                    const on = allergens.includes(a);
                                    return (
                                        <button key={a} type="button" onClick={() => toggleAllergen(a)}
                                            style={{ padding:'6px 13px', borderRadius:99, border:`1.5px solid ${on?'#fca5a5':'#e5e7eb'}`, background:on?'#fef2f2':'#f9fafb', cursor:'pointer', fontSize:'0.78rem', fontWeight:600, color:on?'#dc2626':'#6b7280', transition:'all 0.18s', fontFamily:'inherit' }}>
                                            {a}
                                        </button>
                                    );
                                })}
                            </div>
                        </Field>
                    </div>
                </div>

                {/* ── Photo ── */}
                <div style={{ background:'#fff', borderRadius:20, border:'1px solid #f1f5f9', overflow:'hidden', boxShadow:'0 2px 14px rgba(0,0,0,0.04)', animation:'fadeUp 0.4s ease 0.12s both', opacity:0 }}>
                    <div style={{ padding:'16px 24px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#3b82f6,#1d4ed8)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <Camera size={15} color="#fff"/>
                        </div>
                        <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#0f172a' }}>Food Photo <span style={{ fontSize:'0.75rem', color:'#94a3b8', fontWeight:400 }}>(optional)</span></h3>
                    </div>
                    <div style={{ padding:'20px 24px' }}>
                        {image ? (
                            <div style={{ position:'relative', borderRadius:14, overflow:'hidden', border:'2px solid #bbf7d0' }}>
                                <img src={image} alt="Preview" style={{ width:'100%', maxHeight:220, objectFit:'cover', display:'block' }}/>
                                <button onClick={() => setImage(null)} style={{ position:'absolute', top:10, right:10, width:28, height:28, borderRadius:'50%', background:'rgba(0,0,0,0.55)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                    <X size={13} color="#fff"/>
                                </button>
                            </div>
                        ) : (
                            <label style={{ display:'block', cursor:'pointer' }}>
                                <div style={{ border:'2px dashed #d1d5db', borderRadius:14, padding:'40px 24px', textAlign:'center', background:'#fafafa', transition:'all 0.2s' }}
                                    onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='#22c55e'; el.style.background='#f0fdf4'; }}
                                    onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='#d1d5db'; el.style.background='#fafafa'; }}>
                                    <div style={{ width:52, height:52, borderRadius:16, background:'linear-gradient(135deg,#3b82f6,#1d4ed8)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 6px 20px rgba(59,130,246,0.3)' }}>
                                        <Camera size={24} color="#fff"/>
                                    </div>
                                    <p style={{ fontSize:'0.9rem', fontWeight:700, color:'#374151', marginBottom:4 }}>Click to upload photo</p>
                                    <p style={{ fontSize:'0.72rem', color:'#9ca3af' }}>JPG, PNG — up to 10MB</p>
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display:'none' }}/>
                            </label>
                        )}
                    </div>
                </div>

                {/* ── Pickup & Location ── */}
                <div style={{ background:'#fff', borderRadius:20, border:'1px solid #f1f5f9', overflow:'hidden', boxShadow:'0 2px 14px rgba(0,0,0,0.04)', animation:'fadeUp 0.4s ease 0.18s both', opacity:0 }}>
                    <div style={{ padding:'16px 24px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#f97316,#c2410c)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <MapPin size={15} color="#fff"/>
                        </div>
                        <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#0f172a' }}>Pickup Location</h3>
                    </div>
                    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
                        <LocationPicker onLocationSelect={(loc:any) => setLocation(loc)} required showMap/>

                        <Field label="Pickup Instructions">
                            <textarea placeholder="e.g. Room 201, Science Building. Ask for Prof. Sharma at the reception." value={pickupDetails}
                                onChange={e => setPickupDetails(e.target.value)} rows={3}
                                style={{ ...inp, resize:'none', paddingTop:11 }}/>
                        </Field>
                    </div>
                </div>

                {/* Notice */}
                <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:16, padding:'14px 18px', display:'flex', gap:10, animation:'fadeUp 0.4s ease 0.22s both', opacity:0 }}>
                    <Info size={15} color="#3b82f6" style={{ flexShrink:0, marginTop:2 }}/>
                    <div>
                        <p style={{ fontSize:'0.82rem', fontWeight:600, color:'#1e40af', marginBottom:3 }}>Your listing will be visible to recipients immediately</p>
                        <p style={{ fontSize:'0.75rem', color:'#3b82f6' }}>You'll get notified when someone requests pickup. Make sure your pickup instructions are clear.</p>
                    </div>
                </div>
            </div>

            {/* ── Fixed Bottom Bar ── */}
            <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'rgba(255,255,255,0.96)', backdropFilter:'blur(20px)', borderTop:'1px solid #e5e7eb', padding:'14px 24px', zIndex:40 }}>
                <div style={{ maxWidth:760, margin:'0 auto', display:'flex', gap:12 }}>
                    <button onClick={() => navigate('/donor-dashboard')}
                        style={{ flex:'0 0 auto', padding:'13px 20px', borderRadius:14, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
                        <ArrowLeft size={14}/> Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isSubmitting}
                        style={{ flex:1, padding:'14px 24px', borderRadius:14, border:'none', background:isSubmitting?'#94a3b8':'linear-gradient(135deg,#22c55e,#15803d)', color:'#fff', fontWeight:800, fontSize:'0.95rem', cursor:isSubmitting?'not-allowed':'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:isSubmitting?'none':'0 6px 20px rgba(34,197,94,0.4)', transition:'all 0.2s' }}>
                        {isSubmitting
                            ? <><div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', animation:'spin 0.8s linear infinite' }}/> Posting…</>
                            : <><Zap size={16}/> List Food for Pickup</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}