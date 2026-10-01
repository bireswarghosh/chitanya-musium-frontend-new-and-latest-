import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";

import { ThemeContext } from "../../../context/ThemeContext";

const NavHader = () => {
  const [sideMenu, setSideMenu] = useState(false);
  const { openMenuToggle } = useContext(ThemeContext);

  const handleToogle = () => {
    setSideMenu(!sideMenu);
  };

  return (
    <div className="nav-header">
      <Link to="/museum-entries" className="brand-logo">
        <img
          className="brand-logo-img"
          src="https://www.chaitanyamuseum.org/wp-content/uploads/2025/07/New-LOGO-1.png"
          alt="Sri Chaitanya Mahaprabhu Museum"
          style={{ maxHeight: "58px", maxWidth: "180px", objectFit: "contain" }}
        />
      </Link>

      <div
        className="nav-control"
        onClick={() => {
          handleToogle();
          openMenuToggle();
        }}
      >
        <div className={`hamburger ${sideMenu ? "is-active" : ""}`}>
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </div>
      </div>
    </div>
  );
};

export default NavHader;
