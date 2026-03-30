/**
 * src/components/UI.jsx
 * All shared design-system components used across every screen.
 */

import { useState } from "react";

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 44, color = "var(--blue)" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: color + "22", border: `1.5px solid ${color}33`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: size * 0.35, color, flexShrink: 0,
    }}>{initials}</div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, color, icon }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: color + "18", color, border: `1px solid ${color}30`,
      borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700,
    }}>
      {icon && <span style={{ fontSize: 10 }}>{icon}</span>}{label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, onClick, className }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => onClick && setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={className}
      style={{
        background: "var(--card)", borderRadius: "var(--radius)",
        border: "1px solid var(--line)",
        boxShadow: hov ? "var(--shadow-md)" : "var(--shadow)",
        transform: hov && onClick ? "translateY(-2px)" : "none",
        transition: "all 0.2s ease",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}>{children}</div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Btn({ children, variant = "primary", onClick, style = {}, full, disabled, type = "button" }) {
  const [hov, setHov] = useState(false);
  const base = {
    borderRadius: 12, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 700, fontSize: 14, transition: "all 0.18s ease",
    padding: "12px 20px", display: "inline-flex", alignItems: "center",
    justifyContent: "center", gap: 6, fontFamily: "var(--font)",
    width: full ? "100%" : undefined, opacity: disabled ? 0.6 : 1,
  };
  const variants = {
    primary:   { background: hov ? "var(--navy)" : "var(--blue)", color: "#fff", boxShadow: hov ? "var(--shadow-md)" : "var(--shadow)" },
    secondary: { background: hov ? "var(--blue-pale2)" : "var(--blue-pale)", color: "var(--blue)", border: "1px solid var(--blue-pale2)" },
    ghost:     { background: "transparent", color: "var(--blue)", padding: "10px 16px" },
    orange:    { background: hov ? "#d96b18" : "var(--orange)", color: "#fff", boxShadow: hov ? "var(--shadow-md)" : "var(--shadow)" },
    danger:    { background: hov ? "#FDDEDE" : "#FEF0F0", color: "var(--red)", border: "1px solid #FCCFCF" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, value, onChange, type = "text", placeholder, required }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: "block", fontSize: 11, color: "var(--muted)", fontWeight: 700, marginBottom: 5, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}{required && " *"}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        style={{ width: "100%", border: "1.5px solid var(--line)", borderRadius: 11, padding: "10px 14px", fontSize: 14, outline: "none", color: "var(--text)", background: "var(--white)", boxSizing: "border-box", transition: "border 0.15s" }}
        onFocus={e => e.target.style.borderColor = "var(--blue)"}
        onBlur={e => e.target.style.borderColor = "var(--line)"} />
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: "block", fontSize: 11, color: "var(--muted)", fontWeight: 700, marginBottom: 5, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
      <select value={value} onChange={onChange}
        style={{ width: "100%", border: "1.5px solid var(--line)", borderRadius: 11, padding: "10px 14px", fontSize: 14, outline: "none", color: "var(--text)", background: "var(--white)", boxSizing: "border-box" }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = "var(--blue)", height = 6 }) {
  return (
    <div style={{ height, background: "var(--line)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, value || 0)}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
    </div>
  );
}

// ─── Macro Ring ───────────────────────────────────────────────────────────────
export function MacroRing({ label, value, color, unit = "g" }) {
  const r = 28; const circ = 2 * Math.PI * r;
  const pct = Math.min(100, ((value || 0) / 300) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={72} height={72} viewBox="0 0 72 72">
        <circle cx={36} cy={36} r={r} fill="none" stroke={color + "20"} strokeWidth={7} />
        <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
          strokeLinecap="round" transform="rotate(-90 36 36)" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        <text x={36} y={36} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: 13, fontWeight: 800, fill: "var(--text)", fontFamily: "var(--font)" }}>{value}</text>
      </svg>
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textAlign: "center" }}>
        {label}<br /><span style={{ color, fontWeight: 800 }}>{unit}</span>
      </div>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 32, color = "var(--blue)" }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        border: `3px solid ${color}30`,
        borderTopColor: color,
        animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
export function TopBar({ title, subtitle, back, right }) {
  return (
    <div style={{
      background: "var(--white)", borderBottom: "1px solid var(--line)",
      padding: "14px 20px", display: "flex", alignItems: "center",
      gap: 12, position: "sticky", top: 0, zIndex: 100, boxShadow: "var(--shadow-sm)",
    }}>
      {back && (
        <button onClick={back} style={{ background: "var(--blue-pale)", border: "none", cursor: "pointer", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--blue)", flexShrink: 0 }}>←</button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {subtitle && <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 1 }}>{subtitle}</div>}
        <div style={{ fontWeight: 900, fontSize: 18, color: "var(--text)", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, action, actionLabel }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text)" }}>{title}</h3>
      {action && <button onClick={action} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--blue)", fontWeight: 700, fontFamily: "var(--font)" }}>{actionLabel}</button>}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function Empty({ icon, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text-sub)", marginBottom: 6 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13 }}>{subtitle}</p>}
    </div>
  );
}

// ─── Error Message ────────────────────────────────────────────────────────────
export function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background: "#FEF0F0", border: "1px solid #FCCFCF", borderRadius: 10, padding: "10px 14px", color: "var(--red)", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
      ⚠️ {msg}
    </div>
  );
}

// ─── Goal helpers ─────────────────────────────────────────────────────────────
export const goalColor = (g) => g === "Fat Loss" ? "var(--orange)" : g === "Muscle Gain" ? "var(--blue)" : "var(--green)";
export const goalIcon  = (g) => g === "Fat Loss" ? "🔥" : g === "Muscle Gain" ? "💪" : "⚖️";
export const bmi       = (w, h) => h ? (w / Math.pow(h / 100, 2)).toFixed(1) : "—";
export const ibw       = (h)    => h ? Math.round(45.5 + ((h - 152.4) / 2.54) * 2.3) : "—";
export const bmiCat    = (v)    => v < 18.5 ? { label: "Underweight", c: "var(--blue-mid)" } : v < 25 ? { label: "Healthy", c: "var(--green)" } : v < 30 ? { label: "Overweight", c: "var(--orange)" } : { label: "Obese", c: "var(--red)" };
