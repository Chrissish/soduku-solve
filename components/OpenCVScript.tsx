"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function OpenCVScript() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if it's already loaded (e.g. from cache or previous navigation)
    if (window.cv) {
      setLoaded(true);
    }
  }, []);

  return (
    <Script 
      src="https://docs.opencv.org/4.8.0/opencv.js" 
      strategy="afterInteractive"
      onLoad={() => {
        console.log('OpenCV loaded');
        setLoaded(true);
      }}
      onError={(e) => {
        console.error('Error loading OpenCV', e);
      }}
    />
  );
}
