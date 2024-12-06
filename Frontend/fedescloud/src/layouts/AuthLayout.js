// src/layouts/AuthLayout.js
import React from 'react';
import { motion } from 'framer-motion';
import BackgroundVideo from '../components/BackgroundVideo.js';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
        className="auth-container"
      >
        {children}
      </motion.div>
      <BackgroundVideo />
    </div>
  );
};

export default AuthLayout;
