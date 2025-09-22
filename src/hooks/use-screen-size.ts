import { useState, useEffect } from 'react';

export function useScreenSize() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      // Consider screens 1024px and above as "large" (desktop/admin)
      setIsLargeScreen(width >= 1024);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return {
    isLargeScreen,
    screenWidth,
    isMobile: screenWidth < 768,
    isTablet: screenWidth >= 768 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024
  };
}