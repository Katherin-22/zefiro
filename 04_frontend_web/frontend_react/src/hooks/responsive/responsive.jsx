import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [screen, setScreen] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false
  });

  useEffect(() => {
    function updateScreen() {
      const width = window.innerWidth;
      setScreen({
        width,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 992,
        isDesktop: width >= 992
      });
    }

    updateScreen();
    
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateScreen, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screen;
};