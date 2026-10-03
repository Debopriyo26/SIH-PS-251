import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { User, UserRole, LogisticsZone } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    fullName: string, 
    email: string, 
    password?: string,
    role?: UserRole,
    zone?: LogisticsZone | null
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'vyomix_auth_user';

function resolveUserFromSession(sessionUser: any): User {
  const metadata = sessionUser.user_metadata || {};
  const rawRole = metadata.role;
  const role: UserRole = rawRole === 'MAIN_HEAD' ? 'MAIN_HEAD' :
    (rawRole === 'ZONAL_HEAD' ? 'ZONAL_HEAD' : 
    (sessionUser.email?.toLowerCase().includes('main') ? 'MAIN_HEAD' : 'ZONAL_HEAD'));

  let zone: LogisticsZone | null = null;
  if (role === 'ZONAL_HEAD') {
    zone = (metadata.zone as LogisticsZone) ||
      (sessionUser.email?.toLowerCase().includes('srinagar') ? 'Srinagar' :
       sessionUser.email?.toLowerCase().includes('jaisalmer') ? 'Jaisalmer' :
       sessionUser.email?.toLowerCase().includes('ahmedabad') ? 'Ahmedabad' :
       sessionUser.email?.toLowerCase().includes('kutch') ? 'Kutch' : 'Srinagar');
  }

  return {
    id: sessionUser.id,
    email: sessionUser.email || '',
    fullName: metadata.full_name || sessionUser.email?.split('@')[0] || (role === 'MAIN_HEAD' ? 'Main Logistics Head' : `${zone} Zonal Head`),
    role,
    zone
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Safety timeout: ensure loading state never hangs indefinitely
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // If Supabase is configured, resolve session strictly from Supabase (Requirement 1 & 11)
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession()
        .then(({ data: { session }, error }) => {
          if (error) {
            console.error('Supabase session verification error:', error);
          }
          if (session?.user) {
            const u = resolveUserFromSession(session.user);
            setUser(u);
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(u));
          } else {
            // No authenticated Supabase session exists. Ensure user is null (NO automatic dashboard bypass!)
            setUser(null);
            localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
            localStorage.removeItem(LOCAL_STORAGE_USER_KEY + '_demo');
          }
        })
        .catch((err) => {
          console.error('Session retrieval failure:', err);
          setUser(null);
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        })
        .finally(() => {
          clearTimeout(safetyTimer);
          setIsLoading(false);
        });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const u = resolveUserFromSession(session.user);
          setUser(u);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(u));
        } else if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY + '_demo');
        }
        setIsLoading(false);
      });


      return () => {
        clearTimeout(safetyTimer);
        subscription.unsubscribe();
      };
    } else {
      // Local fallback only if no Supabase configured
      const cachedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (e) {
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        }
      }
      clearTimeout(safetyTimer);
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    if (!password) {
      setIsLoading(false);
      return { success: false, error: 'Password is required to sign in.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          console.error('Supabase sign-in error:', {
            code: error.status,
            message: error.message
          });
          setIsLoading(false);
          return { success: false, error: error.message || 'Invalid email or password.' };
        }

        if (data.user) {
          const u = resolveUserFromSession(data.user);
          setUser(u);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(u));
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Authentication request failed.' };
      }
    }

    setIsLoading(false);
    return { success: false, error: 'Authentication service unavailable.' };
  };

  const signup = async (
    fullName: string, 
    email: string, 
    password?: string,
    role: UserRole = 'ZONAL_HEAD',
    zone: LogisticsZone | null = role === 'ZONAL_HEAD' ? 'Srinagar' : null
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    if (!password) {
      setIsLoading(false);
      return { success: false, error: 'Password is required to create an account.' };
    }

    const assignedZone = role === 'MAIN_HEAD' ? null : zone;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName,
              role,
              zone: assignedZone
            }
          }
        });

        if (error) {
          console.error('Supabase sign-up error:', {
            code: error.status,
            message: error.message
          });
          setIsLoading(false);
          return { success: false, error: error.message || 'Registration failed.' };
        }

        if (data.user) {
          // Requirement 4: DO NOT automatically log the user in after registration
          try {
            await supabase.auth.signOut();
          } catch (e) {}
          setUser(null);
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Registration failed' };
      }
    }

    setIsLoading(false);
    return { success: false, error: 'Authentication service unavailable.' };
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) return { success: false, error: error.message };
    }
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY + '_demo');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
