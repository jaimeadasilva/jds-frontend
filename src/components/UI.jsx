/**
 * Premium UI Components — Apple-level design system
 */
import { useState } from "react";

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 44, color = "var(--royal)" }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.32,
      background: `linear-gradient(135deg, ${color}22, ${color}38)`,
      border: `1.5px solid ${color}28`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.33,
      color, flexShrink: 0,
      fontFamily: "var(--font-display)",
      letterSpacing: "-0.02em",
    }}>{initials}</div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, color, icon, size = "sm" }) {
  const pad = size === "sm" ? "3px 9px" : "4px 12px";
  const fs  = size === "sm" ? 11 : 12;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: color + "14",
      color,
      border: `1px solid ${color}24`,
      borderRadius: 99,
      padding: pad,
      fontSize: fs,
      fontWeight: 600,
      letterSpacing: "0.01em",
      fontFamily: "var(--font-body)",
    }}>
      {icon && <span style={{ fontSize: fs - 1 }}>{icon}</span>}
      {label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, onClick, className, noPad }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onClick && setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={className}
      style={{
        background: "var(--card)",
        borderRadius: "var(--radius)",
        border: `1px solid ${hov && onClick ? "var(--royal-pale2)" : "var(--line)"}`,
        boxShadow: hov && onClick ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hov && onClick ? "translateY(-1px)" : "none",
        transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
        cursor: onClick ? "pointer" : "default",
        padding: noPad ? 0 : "18px 18px",
        overflow: noPad ? "hidden" : undefined,
        ...style,
      }}>{children}</div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Btn({ children, variant = "primary", onClick, style = {}, full, disabled, type = "button", size = "md" }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);

  const padding = size === "sm" ? "8px 16px" : size === "lg" ? "15px 24px" : "11px 20px";
  const fontSize = size === "sm" ? 13 : size === "lg" ? 16 : 14;

  const base = {
    borderRadius: "var(--radius-sm)",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600,
    fontSize,
    transition: "all 0.18s cubic-bezier(0.16,1,0.3,1)",
    padding,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontFamily: "var(--font-body)",
    letterSpacing: "-0.01em",
    width: full ? "100%" : undefined,
    opacity: disabled ? 0.5 : 1,
    transform: pressed ? "scale(0.97)" : "scale(1)",
  };

  const variants = {
    primary: {
      background: hov ? "var(--royal-deep)" : "var(--royal)",
      color: "#fff",
      boxShadow: hov ? "var(--shadow-blue)" : "var(--shadow)",
    },
    secondary: {
      background: hov ? "var(--royal-pale2)" : "var(--royal-pale)",
      color: "var(--royal)",
      border: "1px solid var(--royal-pale2)",
    },
    ghost: {
      background: hov ? "var(--bg2)" : "transparent",
      color: "var(--royal)",
      padding: size === "sm" ? "7px 12px" : "10px 14px",
    },
    amber: {
      background: hov ? "#D97706" : "var(--amber)",
      color: "#fff",
      boxShadow: hov ? "0 8px 24px rgba(245,158,11,0.28)" : "var(--shadow)",
    },
    danger: {
      background: hov ? "#FFE4E6" : "var(--rose-pale)",
      color: "var(--rose)",
      border: "1px solid #FECDD3",
    },
    dark: {
      background: hov ? "#1E293B" : "var(--text)",
      color: "#fff",
      boxShadow: hov ? "var(--shadow-md)" : "var(--shadow)",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{ ...base, ...variants[variant], ...style }}
    >{children}</button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, value, onChange, type = "text", placeholder, required, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{
          display: "block",
          fontSize: 11,
          color: focused ? "var(--royal)" : "var(--muted)",
          fontWeight: 600,
          marginBottom: 6,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          transition: "color 0.15s",
        }}>{label}{required && <span style={{ color: "var(--rose)", marginLeft: 2 }}>*</span>}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          border: `1.5px solid ${focused ? "var(--royal)" : "var(--line)"}`,
          borderRadius: "var(--radius-sm)",
          padding: "11px 14px",
          fontSize: 14,
          outline: "none",
          color: "var(--text)",
          background: focused ? "var(--white)" : "var(--bg)",
          boxSizing: "border-box",
          transition: "all 0.15s",
          boxShadow: focused ? "0 0 0 3px var(--royal-glow)" : "none",
          fontFamily: "var(--font-body)",
        }}
      />
      {hint && <p style={{ fontSize: 11, color: "var(--muted2)", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{ display: "block", fontSize: 11, color: focused ? "var(--royal)" : "var(--muted)", fontWeight: 600, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase", transition: "color 0.15s" }}>{label}</label>
      )}
      <select
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          border: `1.5px solid ${focused ? "var(--royal)" : "var(--line)"}`,
          borderRadius: "var(--radius-sm)",
          padding: "11px 14px",
          fontSize: 14,
          outline: "none",
          color: "var(--text)",
          background: "var(--bg)",
          boxSizing: "border-box",
          transition: "all 0.15s",
          boxShadow: focused ? "0 0 0 3px var(--royal-glow)" : "none",
          fontFamily: "var(--font-body)",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
          paddingRight: 36,
        }}
      >
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = "var(--royal)", height = 5, bg = "var(--line)" }) {
  return (
    <div style={{ height, background: bg, borderRadius: 99, overflow: "hidden" }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, value || 0))}%`,
        height: "100%",
        background: color,
        borderRadius: 99,
        transition: "width 0.7s cubic-bezier(0.16,1,0.3,1)",
      }} />
    </div>
  );
}

// ─── Macro Ring ───────────────────────────────────────────────────────────────
export function MacroRing({ label, value, color, unit = "g" }) {
  const r = 30; const circ = 2 * Math.PI * r;
  const pct = Math.min(100, ((value || 0) / 350) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={76} height={76} viewBox="0 0 76 76">
        <circle cx={38} cy={38} r={r} fill="none" stroke={color + "18"} strokeWidth={6} />
        <circle cx={38} cy={38} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          strokeLinecap="round"
          transform="rotate(-90 38 38)"
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)" }} />
        <text x={38} y={38} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: 14, fontWeight: 700, fill: "var(--text)", fontFamily: "var(--font-display)" }}>
          {value}
        </text>
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.04em" }}>{label}</div>
        <div style={{ fontSize: 10, color, fontWeight: 700 }}>{unit}</div>
      </div>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 28 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 48 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        border: `2.5px solid var(--line)`,
        borderTopColor: "var(--royal)",
        animation: "spin 0.65s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
export function TopBar({ title, subtitle, back, right, transparent }) {
  return (
    <div style={{
      background: transparent ? "transparent" : "rgba(248,250,252,0.92)",
      backdropFilter: transparent ? "none" : "blur(20px)",
      WebkitBackdropFilter: transparent ? "none" : "blur(20px)",
      borderBottom: transparent ? "none" : "1px solid var(--line)",
      padding: "13px 20px",
      display: "flex", alignItems: "center", gap: 12,
      position: "sticky", top: 0, zIndex: 100,
    }}>
      {back && (
        <button onClick={back} style={{
          background: "var(--bg2)",
          border: "1px solid var(--line)",
          cursor: "pointer",
          borderRadius: 10,
          width: 34, height: 34,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: "var(--text2)", flexShrink: 0,
          transition: "all 0.15s",
        }}>←</button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {subtitle && (
          <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 1 }}>{subtitle}</div>
        )}
        <div style={{ fontWeight: 700, fontSize: 17, color: "var(--text)", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "var(--font-display)" }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, action, actionLabel }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>{title}</h3>
      {action && (
        <button onClick={action} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--royal)", fontWeight: 600, fontFamily: "var(--font-body)" }}>{actionLabel}</button>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function Empty({ icon, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 20px", color: "var(--muted)" }}>
      <div style={{ fontSize: 44, marginBottom: 14, opacity: 0.6 }}>{icon}</div>
      <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text2)", marginBottom: 6, fontFamily: "var(--font-display)" }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{subtitle}</p>}
    </div>
  );
}

// ─── Error Message ────────────────────────────────────────────────────────────
export function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background: "var(--rose-pale)", border: "1px solid #FECDD3", borderRadius: "var(--radius-sm)", padding: "10px 14px", color: "var(--rose)", fontSize: 13, fontWeight: 500, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
      <span>⚠️</span> {msg}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, color = "var(--royal)", sub }) {
  return (
    <Card style={{ padding: "16px" }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginTop: 1 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{sub}</div>}
    </Card>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
      {label && <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const goalColor = (g) =>
  g === "Fat Loss" ? "var(--amber)" :
  g === "Muscle Gain" ? "var(--royal)" : "var(--emerald)";

export const goalIcon  = (g) =>
  g === "Fat Loss" ? "🔥" : g === "Muscle Gain" ? "💪" : "⚖️";

export const bmi    = (w, h) => h ? (w / Math.pow(h / 100, 2)).toFixed(1) : "—";
export const ibw    = (h)    => h ? Math.round(45.5 + ((h - 152.4) / 2.54) * 2.3) : "—";
export const bmiCat = (v)    =>
  v < 18.5 ? { label: "Underweight", c: "var(--royal)" } :
  v < 25   ? { label: "Healthy",     c: "var(--emerald)" } :
  v < 30   ? { label: "Overweight",  c: "var(--amber)" } :
             { label: "Obese",       c: "var(--rose)" };
