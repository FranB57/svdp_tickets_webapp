import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { VolunteerSession } from '../types';

const STORAGE_KEY = 'svdp_volunteer_session';

// Hash a PIN using SHA-256
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface AuthContextType {
  session: VolunteerSession | null;
  isAuthenticated: boolean;
  login: (name: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<VolunteerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as VolunteerSession;
        setSession(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (name: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    // Get the expected PIN hash from environment
    // If VITE_VOLUNTEER_PIN_HASH is set, use secure hash comparison
    // Otherwise fall back to plain PIN for local development
    const expectedHash = import.meta.env.VITE_VOLUNTEER_PIN_HASH;
    const expectedPlainPin = import.meta.env.VITE_VOLUNTEER_PIN;

    let isValid = false;

    if (expectedHash) {
      // Secure mode: compare hashes
      const inputHash = await hashPin(pin);
      isValid = inputHash === expectedHash;
    } else if (expectedPlainPin) {
      // Development fallback: plain PIN comparison
      isValid = pin === expectedPlainPin;
    } else {
      // Default PIN for development
      isValid = pin === '1234';
    }

    if (!isValid) {
      return { success: false, error: 'invalidPin' };
    }

    const newSession: VolunteerSession = {
      volunteerName: name.trim(),
      sessionStarted: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  // Don't render children until we've checked localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: session !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
