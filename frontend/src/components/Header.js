
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header style={{paddingBottom: 0, margnBottom: 0, paddingTop: 0}} className="Header">
      <Link to="/" className="header-link">
        <img src={process.env.PUBLIC_URL + "/simatec_shadow02.png"} alt="Simatec Logo" className="white-shadow"/>
        <h1>SIMATEC : Digital Chemistry R & D</h1>
      </Link>
    </header>
  );
}

export default Header;
