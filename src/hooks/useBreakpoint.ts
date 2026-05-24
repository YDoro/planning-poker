import { useEffect, useState } from 'react';

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useBreakpoint = () => {
  const [windowState, setWindowState] = useState({
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    scrollX: typeof window !== 'undefined' ? window.scrollX : 0,
    scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
    isSm: false,
    isMd: false,
    isLg: false,
    isXl: false,
    is2xl: false,
  });

  useEffect(() => {
    const handleResizeOrScroll = () => {
      const width = window.visualViewport?.width || window.innerWidth;
      const height = window.visualViewport?.height || window.innerHeight;
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      setWindowState({
        screenWidth: width,
        screenHeight: height,
        scrollX,
        scrollY,
        isSm: width >= breakpoints.sm,
        isMd: width >= breakpoints.md,
        isLg: width >= breakpoints.lg,
        isXl: width >= breakpoints.xl,
        is2xl: width >= breakpoints['2xl'],
      });
    };

    handleResizeOrScroll();
    
    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll);
    };
  }, []);

  return windowState;
};
