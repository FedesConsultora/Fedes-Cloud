// src/components/Logo.js
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext.js';

const Logo = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="logo">
      <img
        src={
          theme === 'light'
            ? `${process.env.PUBLIC_URL}/assets/images/FedesCloudDark.webp`
            : `${process.env.PUBLIC_URL}/assets/images/logo-dark.png`
        }
        alt="FedesCloud Logo"
      />
      <img className='nube'
      src='/assets/images/Nube.webp'>
      </img>
    </div>
  );
};

export default Logo;
