import React from 'react';

import { initializeAccessibility } from './index';

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    const cleanup = initializeAccessibility();
    return cleanup;
  }, []);

  return <>{children}</>;
};
