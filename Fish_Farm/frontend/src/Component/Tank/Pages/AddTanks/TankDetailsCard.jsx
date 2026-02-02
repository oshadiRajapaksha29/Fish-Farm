import React from "react";

const KV = ({ label, value }) => (
  <div
    style={{
      display: "flex",
      gap: "8px",
      justifyContent: "space-between",
      background: "rgba(255,255,255,.03)",
      border: "1px solid rgba(255,255,255,.06)",
      padding: "10px 12px",
      borderRadius: "10px",
    }}
  >
    <span
      style={{
        color: "#9CA3AF",
        fontSize: "12px",
        letterSpacing: ".02em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
    <span style={{ color: "#F9FAFB", fontWeight: 600 }}>
      {value ?? "—"}
    </span>
  </div>
);

const TankDetailsCard = ({ tank, onClose }) => {
  if (!tank) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(92vw, 720px)",
          background: "#0b1220",
          color: "#e5e7eb",
          border: "1px solid rgba(255,255,255,.06)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background: "rgba(255,255,255,.04)",
            borderBottom: "1px solid rgba(255,255,255,.06)",
          }}
        >
          <h3 style={{ margin: 0 }}>Tank: {tank.TankCode || tank._id}</h3>
          <button
            style={{
              background: "transparent",
              border: 0,
              color: "#fff",
              fontSize: "24px",
              cursor: "pointer",
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px" }}>
          {/* Grid info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0,1fr))",
              gap: "10px 16px",
            }}
          >
            <KV label="Type" value={tank.TankType} />
            <KV label="Location" value={tank.TankLocation} />
            <KV label="Height" value={tank.Height} />
            <KV label="Width" value={tank.Width} />
            <KV label="Length" value={tank.Length} />
            <KV label="Inlet Valves" value={tank.InletValves} />
            <KV label="Outlet Valves" value={tank.OutletValves} />
          </div>

          {/* Description */}
          <div
            style={{
              marginTop: "14px",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: "10px",
              padding: "10px 12px",
              background: "rgba(255,255,255,.03)",
            }}
          >
            <span
              style={{
                color: "#9CA3AF",
                fontSize: "12px",
                letterSpacing: ".02em",
                textTransform: "uppercase",
              }}
            >
              Description
            </span>
            <p style={{ margin: "6px 0 0", color: "#F9FAFB" }}>
              {tank.Description || "No description"}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
            <button
              style={{
                background: "#1f2937",
                color: "#fff",
                border: "1px solid rgba(255,255,255,.08)",
                padding: "8px 12px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
              onClick={() =>
                navigator.clipboard.writeText(JSON.stringify(tank, null, 2))
              }
              title="Copy JSON"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TankDetailsCard;
