import React from "react";
import Navbar from "./Navbar.jsx"; // ✅ fixed path
import { Outlet } from "react-router-dom";
import Footer from "../Footer/footer.jsx"; // Import the Footer component

const NavbarLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet /> {/* Page content */}
      </main>
      <Footer /> {/* Footer will appear on all client-side pages */}
    </>
  );
};

export default NavbarLayout;
