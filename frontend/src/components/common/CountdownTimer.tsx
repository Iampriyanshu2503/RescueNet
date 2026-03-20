import React, { useState, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface Props {
    expiryDate: Date;
    onExpire?: () => void;
    compact?: boolean;
}

export default function CountdownTimer({ expiryDate, onExpire, compact = false }: Props) {
    const calc = useCallback(() => {
        const ms = expiryDate.getTime() - Date.now();
        return Math.max(0, Math.floor(ms / 1000));
    }, [expiryDate]);

    const [secs, setSecs] = useState(calc);
    const [fired, setFired] = useState(false);

    useEffect(() => {
        setSecs(calc());
        setFired(false);
    }, [expiryDate, calc]);

    useEffect(() => {
        if (secs <= 0) {
            if (!fired) { setFired(true); onExpire?.(); }
            return;
        }
        const id = setTimeout(() => setSecs(calc()), 1000);
        return () => clearTimeout(id);
    }, [secs, fired, calc, onExpire]);

    const expired = secs <= 0;
    const urgent  = !expired && secs < 30 * 60;       // < 30 min
    const warning = !expired && !urgent && secs < 2 * 3600; // < 2 hr

    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n: number) => String(n).padStart(2, '0');

    const timeStr = expired
        ? 'Expired'
        : h > 0
            ? `${h}h ${pad(m)}m ${pad(s)}s`
            : `${pad(m)}m ${pad(s)}s`;

    const color  = expired ? '#dc2626' : urgent ? '#dc2626' : warning ? '#f97316' : '#16a34a';
    const bg     = expired ? '#fef2f2' : urgent ? '#fef2f2' : warning ? '#fff7ed' : '#f0fdf4';
    const border = expired ? '#fecaca' : urgent ? '#fecaca' : warning ? '#fed7aa' : '#bbf7d0';
    const Icon   = (expired || urgent) ? AlertTriangle : Clock;

    if (compact) {
        return (
            <span style={{
                display:'inline-flex', alignItems:'center', gap:4,
                padding:'2px 8px', borderRadius:99,
                background:bg, border:`1px solid ${border}`,
                fontSize:'0.72rem', fontWeight:700, color,
                fontFamily:'monospace',
                animation: urgent && !expired ? 'timerPulse 1s ease-in-out infinite' : 'none',
            }}>
                <Icon size={10} color={color}/>
                {timeStr}
            </span>
        );
    }

    return (
        <>
            <style>{`
                @keyframes timerPulse {
                    0%,100% { opacity:1; transform:scale(1); }
                    50%     { opacity:.7; transform:scale(1.03); }
                }
            `}</style>
            <span style={{
                display:'inline-flex', alignItems:'center', gap:6,
                fontSize:'0.78rem', fontWeight:700, color,
                animation: urgent && !expired ? 'timerPulse 1s ease-in-out infinite' : 'none',
            }}>
                <Icon size={13} color={color}/>
                {expired ? 'Expired' : `Expires in ${timeStr}`}
            </span>
        </>
    );
}