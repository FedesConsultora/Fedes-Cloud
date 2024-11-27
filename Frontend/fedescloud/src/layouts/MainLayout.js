// src/layouts/MainLayout.js
import React from 'react';
import Sidebar from '../components/Sidebar.js';
import Footer from '../components/Footer.js';

const MainLayout = ({ children }) => {

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
