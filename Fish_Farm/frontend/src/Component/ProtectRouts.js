import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

/**
 * Usage:
 * <ProtectRouts>
 *   <DashboardLayout />
 * </ProtectRouts>
 *
 * Optional role gate:
 * <ProtectRouts role="admin">...</ProtectRouts>
 */
export default function ProtectRouts({ children, role }) {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, ok: false, user: null });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const token = localStorage.getItem("token"); // if you store it
        const res = await fetch("http://localhost:5000/api/check-auth", {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include", // include cookies if you use them
        });

        const data = await res.json().catch(() => ({}));

        // Normalize success flag
        const success = data?.success === true && res.ok;

        if (!success) {
          if (alive) {
            toast.error(data?.message || "You must sign in to continue.");
            setState({ loading: false, ok: false, user: null });
          }
          return;
        }

        // Optional role check (expects data.data.role from backend)
        if (role && data?.data?.role && data.data.role !== role) {
          if (alive) {
            toast.error("You do not have permission to view this page.");
            setState({ loading: false, ok: false, user: null });
          }
          return;
        }

        if (alive) setState({ loading: false, ok: true, user: data?.data || null });
      } catch (err) {
        if (alive) {
          toast.error("Network error while checking authentication.");
          setState({ loading: false, ok: false, user: null });
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [role]);

  if (state.loading) {
    return (
      <div style={{ minHeight: "40vh", display: "grid", placeItems: "center" }}>
        Checking authentication…
      </div>
    );
  }

  return state.ok ? children : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}
