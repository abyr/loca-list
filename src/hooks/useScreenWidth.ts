import { useState, useEffect } from 'react';

export function useScreenWidth(breakpoint: number = 768): {
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
