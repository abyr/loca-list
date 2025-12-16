import { useState, useEffect } from 'react';

const PHONE_MAX_WIDTH = 768;

export function useScreenWidth(breakpoint: number = PHONE_MAX_WIDTH): {
  width: number;
  isMobile: boolean;
} {

  const getWidth = () => (typeof window !== 'undefined' ? window.innerWidth : 0);
  const [width, setWidth] = useState<number>(getWidth());

  useEffect(() => {
    const handleResize = () => {
        setWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { width, isMobile: (width < breakpoint) };
}
