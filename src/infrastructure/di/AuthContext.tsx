import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { User } from "@/domain/AuthPort";

import {
  initializeDatabase,
  resetDatabase,
  setActiveUserId,
} from "@/database/database";
import { LocalAuthAdapter } from "../auth/LocalAuthAdapter";

interface AuthContextValue {
  user: User | null;
  isInitializing: boolean;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  resetPassword(email: string, profileName: string, newPassword: string): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useMemo(() => new LocalAuthAdapter(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const currentUser = await auth.getCurrentUser();
        if (currentUser) {
          setActiveUserId(currentUser.id);
          await initializeDatabase();
        }
        if (mounted) {
          setUser(currentUser);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    }

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, [auth]);

  const login = useCallback(
    async (email: string, password: string) => {
      const loggedIn = await auth.login(email, password);
      try {
        setActiveUserId(loggedIn.id);
        await initializeDatabase();
        setUser(loggedIn);
      } catch (error) {
        await auth.logout();
        await resetDatabase();
        setUser(null);
        throw error;
      }
    },
    [auth],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const created = await auth.register(name, email, password);
      try {
        setActiveUserId(created.id);
        await initializeDatabase();
        setUser(created);
      } catch (error) {
        await auth.logout();
        await resetDatabase();
        setUser(null);
        throw error;
      }
    },
    [auth],
  );

  const logout = useCallback(async () => {
    await auth.logout();
    await resetDatabase();
    setUser(null);
  }, [auth]);

  const resetPassword = useCallback(
    async (email: string, profileName: string, newPassword: string) => {
      await auth.resetPassword(email, profileName, newPassword);
    },
    [auth],
  );

  const value = useMemo(
    () => ({ user, isInitializing, login, register, resetPassword, logout }),
    [user, isInitializing, login, register, resetPassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return ctx;
}
