import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav({ tabs }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, zIndex: 200,
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderTop: "1px solid var(--line)",
      display: "flex",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {tabs.map(tab => {
        const isActive = pathname === tab.path || (tab.path !== "/" && pathname.startsWith(tab.path));
        return (
          <button key={tab.id} onClick={() => navigate(tab.path)}
            style={{
              flex: 1, background: "none", border: "none", cursor: "pointer",
              padding: "11px 8px 9px",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3,
              transition: "all 0.2s", fontFamily: "var(--font-body)",
              position: "relative",
            }}>
            {/* Active indicator pill */}
            {isActive && (
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 32, height: 2.5, borderRadius: 99,
                background: "var(--royal)",
              }} />
            )}
            <div style={{
              fontSize: 19, lineHeight: 1,
              filter: isActive ? "none" : "grayscale(1) opacity(0.38)",
              transform: isActive ? "scale(1.08)" : "scale(1)",
              transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
            }}>{tab.icon}</div>
            <span style={{
              fontSize: 10,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? "var(--royal)" : "var(--muted)",
              letterSpacing: "0.01em",
              transition: "all 0.2s",
            }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
