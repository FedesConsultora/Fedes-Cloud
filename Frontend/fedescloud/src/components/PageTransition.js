// src/components/PageTransition.js
import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  initial: {
    opacity: 0,
    x: 100,
    y: 0,
  },
  in: {
    opacity: 1,
    x: 0,
    y: 0,
  },
  out: {
    opacity: 0,
    x: -100,
    y: 0,
  },
};

const transition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={transition}
      className='motiondiv'
      style={ { position: 'absolute', } }
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
