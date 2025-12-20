
import React from 'react';

function Header() {
  return (
    <header style={{paddingBottom: 0, margnBottom: 0, paddingTop: 0}} className="Header">
      <img src={process.env.PUBLIC_URL + "/simatec_shadow02.png"} alt="Simatec Logo" className="white-shadow"/>
      {/* <h1>AI-powered Molecular Modelling R&D Service Solution</h1> */}
      <h1>SIMATEC : Digital Chemistry R & D</h1>
    </header>
  );
}

export default Header;
