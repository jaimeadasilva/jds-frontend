/**
 * useToast — lightweight toast notification system
 * Usage: const { toast } = useToast()
 *        toast.success("Saved!") / toast.error("Failed") / toast.info("Loading...")
 */
import { createContext, useContext, useState, useCallback } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);

  const toast = {
    success: (msg) => show(msg, "success"),
    error:   (msg) => show(msg, "error"),
    info:    (msg) => show(msg, "info"),
  };

  const icons = { success: "✓", error: "✕", info: "ℹ" };
  const colors = {
    success: { bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46", icon: "#10B981" },
    error:   { bg: "#FFF1F2", border: "#FECDD3", text: "#881337", icon: "#F43F5E" },
    info:    { bg: "#EFF6FF", border: "#BFDBFE", text: "#1E3A8A", icon: "#2563EB" },
  };

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", zIndex:9999, display:"flex", flexDirection:"column", gap:8, width:"calc(100% - 32px)", maxWidth:398, pointerEvents:"none" }}>
        {toasts.map(t => {
          const c = colors[t.type];
          return (
            <div key={t.id} style={{
              background: c.bg, border:`1px solid ${c.border}`,
              borderRadius:12, padding:"12px 16px",
              display:"flex", alignItems:"center", gap:10,
              boxShadow:"0 8px 24px rgba(0,0,0,0.10)",
              animation:"slideDown 0.3s cubic-bezier(0.16,1,0.3,1)",
              pointerEvents:"all",
            }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:c.icon+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:c.icon, fontWeight:800, flexShrink:0 }}>{icons[t.type]}</div>
              <span style={{ fontSize:13, fontWeight:600, color:c.text, fontFamily:"var(--font-body)" }}>{t.message}</span>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
