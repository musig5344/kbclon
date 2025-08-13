import { lazy, ComponentType } from 'react';
/**
 * Enhanced lazy loading with retry logic
 * Prevents chunk loading errors in production
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Retry once with page refresh
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        // This will never be reached, but TypeScript needs it
        return componentImport();
      }
      // If already retried, throw the error
      throw error;
    }
  });
}