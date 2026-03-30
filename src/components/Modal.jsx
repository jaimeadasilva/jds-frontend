/**
 * Modal — reusable dialog with backdrop
 * Handles confirm dialogs, forms, alerts
 */
import { useEffect } from "react";

export function Modal({ open, onClose, title, children, maxWidth = 380 }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:1000,
        background:"rgba(15,23,42,0.45)",
        backdropFilter:"blur(4px)",
        display:"flex", alignItems:"flex-end", justifyContent:"center",
        padding:"0 0 env(safe-area-inset-bottom,0px)",
        animation:"backdropIn 0.2s ease",
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:"var(--white)",
          borderRadius:"20px 20px 0 0",
          padding:"0 0 24px",
          width:"100%", maxWidth,
          boxShadow:"0 -8px 40px rgba(15,23,42,0.15)",
          animation:"sheetUp 0.3s cubic-bezier(0.16,1,0.3,1)",
          maxHeight:"85vh",
          overflow:"auto",
        }}>
        {/* Drag handle */}
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
          <div style={{ width:36, height:4, borderRadius:99, background:"var(--line2)" }} />
        </div>
        {title && (
          <div style={{ padding:"8px 24px 16px", borderBottom:"1px solid var(--line)" }}>
            <h3 style={{ margin:0, fontSize:17, fontWeight:700, color:"var(--text)", fontFamily:"var(--font-display)", letterSpacing:"-0.02em" }}>{title}</h3>
          </div>
        )}
        <div style={{ padding: title ? "20px 24px 0" : "8px 24px 0" }}>
          {children}
        </div>
      </div>
      <style>{`
        @keyframes backdropIn { from { opacity:0; } to { opacity:1; } }
        @keyframes sheetUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
      `}</style>
    </div>
  );
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "Delete", confirmVariant = "danger", loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p style={{ fontSize:14, color:"var(--text2)", lineHeight:1.6, margin:"0 0 20px" }}>{message}</p>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onClose}
          style={{ flex:1, border:"1px solid var(--line)", background:"var(--bg)", color:"var(--text2)", borderRadius:11, padding:"12px", cursor:"pointer", fontWeight:600, fontSize:14, fontFamily:"var(--font-body)" }}>
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          style={{ flex:1, border:"none", background: confirmVariant==="danger" ? "var(--rose)" : "var(--royal)", color:"#fff", borderRadius:11, padding:"12px", cursor:"pointer", fontWeight:700, fontSize:14, fontFamily:"var(--font-body)", opacity: loading ? 0.6 : 1 }}>
          {loading ? "…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
