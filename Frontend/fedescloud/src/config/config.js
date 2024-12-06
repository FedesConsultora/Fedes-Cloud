// src/config/config.js

const config = {
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
    CLIENT_URI: process.env.REACT_APP_CLIENT_URI || 'http://localhost:3000',
  };
  
  export default config;
  