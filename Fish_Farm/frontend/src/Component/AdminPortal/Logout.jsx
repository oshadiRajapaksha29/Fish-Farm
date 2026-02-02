// src/pages/Logout.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // Clear local tokens regardless of backend cookie usage
        localStorage.removeItem("token");

        const res = await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data?.success) {
          toast.success("Logged out");
        } else {
          toast.error(data?.message || "Failed to log out");
        }
      } catch {
        toast.error("Network error while logging out");
      } finally {
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate]);

  return (
    <div style={{ minHeight: "40vh", display: "grid", placeItems: "center" }}>
      Logging you out…
    </div>
  );
}
