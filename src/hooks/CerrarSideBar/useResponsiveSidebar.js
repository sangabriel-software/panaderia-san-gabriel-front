import { useEffect } from 'react';

export const useResponsiveSidebar = (setShowSidebar) => {
  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setShowSidebar]); // Dependencia: setShowSidebar
};