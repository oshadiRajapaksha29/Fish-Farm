import React from "react";

const Logout = () => {
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/logout", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        if (data?.success) {
          window.location.href = "/";
        } else {
          console.error("Logout failed:", data);
        }
      } catch (err) {
        console.error("Error during logout:", err);
      }
    })();
  }, []);

  return <div>Logging Out...</div>;
};

export default Logout;
