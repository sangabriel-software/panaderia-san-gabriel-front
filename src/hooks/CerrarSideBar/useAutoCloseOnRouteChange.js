import { useEffect } from 'react';

export const useAutoCloseOnRouteChange = (isMobile, closeSidebar) => {
  useEffect(() => {
    if (isMobile) closeSidebar();
  }, [isMobile, closeSidebar]); // Dependencias: isMobile y closeSidebar
};