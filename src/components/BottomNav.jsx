import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav({ tabs }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (tab) => {
    // Home tabs need exact match to avoid matching all sub-routes
    if (tab.exact || tab.path === "/coach" || tab.path === "/client") {
      return pathname === tab.path;
    }
    return pathname === tab.path || pathname.startsWith(tab.path + "/");
  };

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, zIndex: 200,
      background: "rgba(255,255,255,0.94)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderTop: "1px solid var(--line)",
      display: "flex",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {tabs.map(tab => {
        const active = isActive(tab);
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
            {active && (
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 28, height: 2.5, borderRadius: 99,
                background: "var(--royal)",
              }} />
            )}
            <div style={{
              fontSize: 20, lineHeight: 1,
              filter: active ? "none" : "grayscale(1) opacity(0.35)",
              transform: active ? "scale(1.1)" : "scale(1)",
              transition: "all 0.22s cubic-bezier(0.16,1,0.3,1)",
            }}>{tab.icon}</div>
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500,
              color: active ? "var(--royal)" : "var(--muted)",
              letterSpacing: "0.01em", transition: "all 0.2s",
            }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
