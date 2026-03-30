import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav({ tabs }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, zIndex: 200,
      background: "var(--white)", borderTop: "1px solid var(--line)",
      display: "flex", boxShadow: "0 -4px 24px rgba(26,58,74,0.07)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {tabs.map(tab => {
        const isActive = pathname === tab.path || (tab.path !== "/" && pathname.startsWith(tab.path));
        return (
          <button key={tab.id} onClick={() => navigate(tab.path)}
            style={{
              flex: 1, background: "none", border: "none", cursor: "pointer",
              padding: "12px 8px 10px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 4, transition: "all 0.15s", fontFamily: "var(--font)",
            }}>
            <div style={{ fontSize: 20, lineHeight: 1, filter: isActive ? "none" : "grayscale(1) opacity(0.45)", transform: isActive ? "scale(1.1)" : "scale(1)", transition: "all 0.2s" }}>{tab.icon}</div>
            <span style={{ fontSize: 10, fontWeight: isActive ? 800 : 500, color: isActive ? "var(--blue)" : "var(--muted)" }}>{tab.label}</span>
            {isActive && <div style={{ width: 4, height: 4, borderRadius: 99, background: "var(--blue)", marginTop: -2 }} />}
          </button>
        );
      })}
    </nav>
  );
}
