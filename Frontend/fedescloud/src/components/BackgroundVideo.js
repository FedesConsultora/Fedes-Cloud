// src/components/BackgroundVideo.js
import React from 'react';

const BackgroundVideo = () => {
  return (
    <div className="background-video">
      <video  autoPlay loop muted src='/assets/videos/background.mp4' />
    </div>
  );
};

export default BackgroundVideo;
