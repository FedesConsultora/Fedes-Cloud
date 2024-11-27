// src/layouts/AuthLayout.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundVideo from '../components/BackgroundVideo.js';

const AuthLayout = ({ children, isRegister }) => {
  return (
    <div className="auth-layout">
        
      <AnimatePresence mode='wait'>
        <motion.div
          key={isRegister ? 'register' : 'login'}
          initial={{ opacity: 0, x: isRegister ? -100 : 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRegister ? 100 : -100 }}
          transition={{ duration: 0.5 }}
          className="auth-container"
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <BackgroundVideo />
    </div>
  );
};

export default AuthLayout;
