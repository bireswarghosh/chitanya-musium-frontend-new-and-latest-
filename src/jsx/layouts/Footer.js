import React from "react";

const Footer = () => {
  var d = new Date();
  return (
    <div className="footer">
      <div className="copyright">
        <p>
          © {d.getFullYear()} All Rights Reserved &nbsp;·&nbsp; Made with{" "}
          <span style={{ color: "#e25555" }}>♥</span> by{" "}
          <strong>Appstrice</strong>
        </p>
      </div>
    </div>
  );
};

export default Footer;
