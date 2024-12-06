// src/components/Logo.js
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext.js';
import { Link } from 'react-router-dom';

const Logo = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="logo">
      <Link to="/">
        <img
          src={
            theme === 'light'
              ? `${process.env.PUBLIC_URL}/assets/images/FedesCloudDark.webp`
              : `${process.env.PUBLIC_URL}/assets/images/FedesCloudLight.webp`
          }
          alt="FedesCloud Logo"
        />
        <img
          className="nube"
          src="/assets/images/nubeColor.webp"
          alt="Nube"
        />
      </Link>
    </div>
  );
};

export default Logo;
