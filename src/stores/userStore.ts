// Deprecated: userStore has been replaced with AuthContext
// This is a temporary compatibility shim to prevent build errors
// All functionality has been moved to AuthContext
import { useAuth } from '../core/auth/AuthContext';
// Legacy interface for backward compatibility
// interface LegacyUserState {
//   session: any;
//   user: any;
//   loading: boolean;
//   isPageLoading: boolean;
//   setSession: (session: any) => void;
//   setUser: (user: any) => void;
//   setPageLoading: (isLoading: boolean) => void;
//   checkUserSession: () => Promise<void>;
//   signInWithPassword: (email: string, password: string) => Promise<any>;
//   signUp: (email: string, password: string) => Promise<void>;
//   signOut: () => Promise<void>;
// }
// Compatibility wrapper that redirects to AuthContext
export const useUserStore = (selector?: any): any => {
  const auth = useAuth();
  // If no selector is provided, return the auth object directly
  if (!selector) {
    return {
      session: auth.session,
      user: auth.user,
      loading: auth.loading,
      isPageLoading: false, // This was moved to local state management
      setSession: () => {},
      setUser: () => {},
      setPageLoading: () => {},
      checkUserSession: async () => {},
      signInWithPassword: auth.login,
      signUp: auth.signup,
      signOut: auth.logout,
    };
  }
  // Handle selector-based access
  const state = {
    session: auth.session,
    user: auth.user,
    loading: auth.loading,
    isPageLoading: false,
    setSession: () => {},
    setUser: () => {},
    setPageLoading: () => {},
    checkUserSession: async () => {},
    signInWithPassword: auth.login,
    signUp: auth.signup,
    signOut: auth.logout,
  };
  return selector(state);
};
