/**
 * Premium UI Design System — Production v2
 * Royal blue palette · Sora + Inter · Apple-level micro-interactions
 */
import { useState } from "react";

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 44, color = "var(--royal)" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32,
      background: `linear-gradient(135deg, ${color}20, ${color}36)`,
      border: `1.5px solid ${color}26`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.33, color, flexShrink: 0,
      fontFamily: "var(--font-display)", letterSpacing: "-0.02em",
    }}>{initials}</div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, color, icon }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: color + "14", color,
      border: `1px solid ${color}22`,
      borderRadius: 99, padding: "3px 9px",
      fontSize: 11, fontWeight: 600, letterSpacing: "0.01em",
    }}>
      {icon && <span style={{ fontSize: 10 }}>{icon}</span>}{label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, onClick, className, noPad }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => onClick && setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={className}
      style={{
        background: "var(--card)", borderRadius: "var(--radius)",
        border: `1px solid ${hov && onClick ? "var(--royal-pale2)" : "var(--line)"}`,
        boxShadow: hov && onClick ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hov && onClick ? "translateY(-1px)" : "none",
        transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
        cursor: onClick ? "pointer" : "default",
        padding: noPad ? 0 : "18px",
        overflow: noPad ? "hidden" : undefined,
        ...style,
      }}>{children}</div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Btn({ children, variant = "primary", onClick, style = {}, full, disabled, type = "button", size = "md", loading }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  const padding = size === "sm" ? "7px 14px" : size === "lg" ? "14px 24px" : "10px 18px";
  const fontSize = size === "sm" ? 13 : size === "lg" ? 15 : 14;

  const base = {
    borderRadius: "var(--radius-sm)", border: "none",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    fontWeight: 600, fontSize,
    transition: "all 0.18s cubic-bezier(0.16,1,0.3,1)",
    padding, display: "inline-flex", alignItems: "center",
    justifyContent: "center", gap: 6,
    fontFamily: "var(--font-body)", letterSpacing: "-0.01em",
    width: full ? "100%" : undefined,
    opacity: disabled ? 0.45 : 1,
    transform: pressed ? "scale(0.97)" : "scale(1)",
  };
  const vars = {
    primary:   { background: hov ? "var(--royal-deep)" : "var(--royal)", color: "#fff", boxShadow: hov ? "var(--shadow-blue)" : "var(--shadow)" },
    secondary: { background: hov ? "var(--royal-pale2)" : "var(--royal-pale)", color: "var(--royal)", border: "1px solid var(--royal-pale2)" },
    ghost:     { background: hov ? "var(--bg2)" : "transparent", color: "var(--royal)", padding: size === "sm" ? "6px 10px" : "9px 12px" },
    amber:     { background: hov ? "#D97706" : "var(--amber)", color: "#fff", boxShadow: hov ? "0 8px 24px rgba(245,158,11,0.28)" : "var(--shadow)" },
    danger:    { background: hov ? "#FFE4E6" : "var(--rose-pale)", color: "var(--rose)", border: "1px solid #FECDD3" },
    dark:      { background: hov ? "#1E293B" : "var(--text)", color: "#fff", boxShadow: hov ? "var(--shadow-md)" : "var(--shadow)" },
    success:   { background: hov ? "#059669" : "var(--emerald)", color: "#fff", boxShadow: hov ? "0 8px 24px rgba(16,185,129,0.28)" : "var(--shadow)" },
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
      style={{ ...base, ...vars[variant], ...style }}>
      {loading ? <span style={{ display:"inline-block", width:14, height:14, borderRadius:"50%", border:"2px solid currentColor", borderTopColor:"transparent", animation:"spin 0.6s linear infinite" }} /> : children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, value, onChange, type = "text", placeholder, required, hint, autoFocus }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 13 }}>
      {label && (
        <label style={{ display:"block", fontSize:11, color: focused ? "var(--royal)" : "var(--muted)", fontWeight:600, marginBottom:5, letterSpacing:"0.06em", textTransform:"uppercase", transition:"color 0.15s" }}>
          {label}{required && <span style={{ color:"var(--rose)", marginLeft:2 }}>*</span>}
        </label>
      )}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} autoFocus={autoFocus}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width:"100%", border:`1.5px solid ${focused ? "var(--royal)" : "var(--line)"}`, borderRadius:"var(--radius-sm)", padding:"10px 13px", fontSize:14, outline:"none", color:"var(--text)", background: focused ? "var(--white)" : "var(--bg)", boxSizing:"border-box", transition:"all 0.15s", boxShadow: focused ? "0 0 0 3px var(--royal-glow)" : "none", fontFamily:"var(--font-body)" }} />
      {hint && <p style={{ fontSize:11, color:"var(--muted2)", marginTop:4 }}>{hint}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ label, value, onChange, placeholder, rows = 3, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 13 }}>
      {label && <label style={{ display:"block", fontSize:11, color: focused ? "var(--royal)" : "var(--muted)", fontWeight:600, marginBottom:5, letterSpacing:"0.06em", textTransform:"uppercase", transition:"color 0.15s" }}>{label}{required && <span style={{ color:"var(--rose)", marginLeft:2 }}>*</span>}</label>}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} required={required}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width:"100%", border:`1.5px solid ${focused ? "var(--royal)" : "var(--line)"}`, borderRadius:"var(--radius-sm)", padding:"10px 13px", fontSize:14, outline:"none", color:"var(--text)", background: focused ? "var(--white)" : "var(--bg)", boxSizing:"border-box", transition:"all 0.15s", boxShadow: focused ? "0 0 0 3px var(--royal-glow)" : "none", fontFamily:"var(--font-body)", resize:"vertical", lineHeight:1.55 }} />
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 13 }}>
      {label && <label style={{ display:"block", fontSize:11, color: focused ? "var(--royal)" : "var(--muted)", fontWeight:600, marginBottom:5, letterSpacing:"0.06em", textTransform:"uppercase", transition:"color 0.15s" }}>{label}</label>}
      <select value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width:"100%", border:`1.5px solid ${focused ? "var(--royal)" : "var(--line)"}`, borderRadius:"var(--radius-sm)", padding:"10px 36px 10px 13px", fontSize:14, outline:"none", color:"var(--text)", background:"var(--bg)", boxSizing:"border-box", transition:"all 0.15s", boxShadow: focused ? "0 0 0 3px var(--royal-glow)" : "none", fontFamily:"var(--font-body)", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%2364748B' d='M5 6L0 0h10z'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 13px center" }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = "var(--royal)", height = 5 }) {
  return (
    <div style={{ height, background:"var(--line)", borderRadius:99, overflow:"hidden" }}>
      <div style={{ width:`${Math.min(100, Math.max(0, value || 0))}%`, height:"100%", background:color, borderRadius:99, transition:"width 0.7s cubic-bezier(0.16,1,0.3,1)" }} />
    </div>
  );
}

// ─── Macro Ring ───────────────────────────────────────────────────────────────
export function MacroRing({ label, value, color, unit = "g" }) {
  const r = 30; const circ = 2 * Math.PI * r;
  const pct = Math.min(100, ((value || 0) / 350) * 100);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <svg width={76} height={76} viewBox="0 0 76 76">
        <circle cx={38} cy={38} r={r} fill="none" stroke={color + "18"} strokeWidth={6} />
        <circle cx={38} cy={38} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
          strokeLinecap="round" transform="rotate(-90 38 38)"
          style={{ transition:"stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)" }} />
        <text x={38} y={38} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize:13, fontWeight:700, fill:"var(--text)", fontFamily:"var(--font-display)" }}>{value}</text>
      </svg>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:11, color:"var(--muted)", fontWeight:600 }}>{label}</div>
        <div style={{ fontSize:10, color, fontWeight:700 }}>{unit}</div>
      </div>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 28, inline }) {
  const el = (
    <div style={{ width:size, height:size, borderRadius:"50%", border:`2.5px solid var(--line)`, borderTopColor:"var(--royal)", animation:"spin 0.65s linear infinite" }} />
  );
  if (inline) return el;
  return <div style={{ display:"flex", justifyContent:"center", alignItems:"center", padding:48 }}>{el}<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ width = "100%", height = 16, radius = 8 }) {
  return (
    <div style={{ width, height, borderRadius:radius, background:"linear-gradient(90deg, var(--line) 25%, var(--bg2) 50%, var(--line) 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite" }}>
      <style>{`@keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}`}</style>
    </div>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
export function TopBar({ title, subtitle, back, right }) {
  return (
    <div style={{ background:"rgba(248,250,252,0.92)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:"1px solid var(--line)", padding:"13px 20px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:100 }}>
      {back && (
        <button onClick={back} style={{ background:"var(--bg2)", border:"1px solid var(--line)", cursor:"pointer", borderRadius:10, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"var(--text2)", flexShrink:0, transition:"all 0.15s" }}>←</button>
      )}
      <div style={{ flex:1, minWidth:0 }}>
        {subtitle && <div style={{ fontSize:10, color:"var(--muted)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:1 }}>{subtitle}</div>}
        <div style={{ fontWeight:700, fontSize:17, color:"var(--text)", letterSpacing:"-0.02em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:"var(--font-display)" }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, action, actionLabel }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
      <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:"var(--text)", fontFamily:"var(--font-display)", letterSpacing:"-0.01em" }}>{title}</h3>
      {action && <button onClick={action} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"var(--royal)", fontWeight:600, fontFamily:"var(--font-body)" }}>{actionLabel}</button>}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function Empty({ icon, title, subtitle, action, actionLabel }) {
  return (
    <div style={{ textAlign:"center", padding:"52px 20px", color:"var(--muted)" }}>
      <div style={{ fontSize:44, marginBottom:14, opacity:0.55 }}>{icon}</div>
      <p style={{ fontWeight:700, fontSize:15, color:"var(--text2)", marginBottom:6, fontFamily:"var(--font-display)" }}>{title}</p>
      {subtitle && <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.6, marginBottom: action ? 18 : 0 }}>{subtitle}</p>}
      {action && <button onClick={action} style={{ background:"var(--royal)", color:"#fff", border:"none", borderRadius:"var(--radius-sm)", padding:"10px 20px", cursor:"pointer", fontWeight:600, fontSize:14, fontFamily:"var(--font-body)" }}>{actionLabel}</button>}
    </div>
  );
}

// ─── Error Message ────────────────────────────────────────────────────────────
export function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background:"var(--rose-pale)", border:"1px solid #FECDD3", borderRadius:"var(--radius-sm)", padding:"10px 14px", color:"var(--rose)", fontSize:13, fontWeight:500, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
      <span>⚠️</span>{msg}
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
export function Toggle({ on, onChange, label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0" }}>
      {label && <span style={{ fontSize:14, color:"var(--text2)", fontWeight:500 }}>{label}</span>}
      <div onClick={() => onChange(!on)} style={{ width:44, height:26, borderRadius:13, background: on ? "var(--royal)" : "var(--line2)", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
        <div style={{ position:"absolute", width:20, height:20, borderRadius:"50%", background:"#fff", top:3, left: on ? 21 : 3, transition:"left 0.2s cubic-bezier(0.16,1,0.3,1)", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
      </div>
    </div>
  );
}

// ─── Pill Tabs ────────────────────────────────────────────────────────────────
export function PillTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display:"flex", background:"var(--bg2)", borderRadius:12, padding:3, gap:2 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{ flex:1, borderRadius:9, border:"none", cursor:"pointer", padding:"9px 8px", background: active===t.id ? "var(--white)" : "transparent", boxShadow: active===t.id ? "var(--shadow-sm)" : "none", fontWeight: active===t.id ? 700 : 500, fontSize:13, color: active===t.id ? "var(--royal)" : "var(--muted)", fontFamily:"var(--font-body)", transition:"all 0.2s", whiteSpace:"nowrap" }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Completion Celebration ───────────────────────────────────────────────────
export function CompletionBanner({ show }) {
  if (!show) return null;
  return (
    <div style={{ background:"linear-gradient(135deg, var(--emerald), #059669)", borderRadius:"var(--radius)", padding:"16px 18px", marginBottom:16, display:"flex", alignItems:"center", gap:12, animation:"scaleIn 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      <div style={{ fontSize:28 }}>🎉</div>
      <div>
        <div style={{ fontWeight:800, color:"#fff", fontSize:15, fontFamily:"var(--font-display)" }}>Workout Complete!</div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", marginTop:2 }}>Excellent work today. Keep it up!</div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const goalColor = (g) => g==="Fat Loss" ? "var(--amber)" : g==="Muscle Gain" ? "var(--royal)" : "var(--emerald)";
export const goalIcon  = (g) => g==="Fat Loss" ? "🔥" : g==="Muscle Gain" ? "💪" : "⚖️";
export const bmi    = (w, h) => h ? (w / Math.pow(h/100, 2)).toFixed(1) : "—";
export const ibw    = (h)    => h ? Math.round(45.5 + ((h-152.4)/2.54)*2.3) : "—";
export const bmiCat = (v)    => v<18.5 ? {label:"Underweight",c:"var(--royal)"} : v<25 ? {label:"Healthy",c:"var(--emerald)"} : v<30 ? {label:"Overweight",c:"var(--amber)"} : {label:"Obese",c:"var(--rose)"};
