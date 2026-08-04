import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";

import {
  loadAppSettings,
  updateAppSettings,
  type ThemeMode,
} from "../settings/appSettings";
import { colors, darkColors, type Colors } from "./colors";
import { createShadows, type Shadows } from "./shadows";

interface ThemeContextValue {
  colors: Colors;
  isDark: boolean;
  isLoaded: boolean;
  mode: ThemeMode;
  scheme: "light" | "dark";
  shadows: Shadows;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadAppSettings()
      .then((settings) => {
        if (isMounted) {
          setModeState(settings.themeMode);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const scheme =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;
  const isDark = scheme === "dark";
  const themeColors = isDark ? darkColors : colors;
  const shadows = useMemo(() => createShadows(themeColors), [themeColors]);

  const setMode = useCallback(async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    await updateAppSettings((current) => ({
      ...current,
      themeMode: nextMode,
    }));
  }, []);

  const toggleTheme = useCallback(async () => {
    await setMode(isDark ? "light" : "dark");
  }, [isDark, setMode]);

  const value = useMemo(
    () => ({
      colors: themeColors,
      isDark,
      isLoaded,
      mode,
      scheme,
      shadows,
      setMode,
      toggleTheme,
    }),
    [
      isDark,
      isLoaded,
      mode,
      scheme,
      setMode,
      shadows,
      themeColors,
      toggleTheme,
    ],
  );

  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  const context = useContext(ThemeContext);
  const systemScheme = useColorScheme();
  const isDark = systemScheme === "dark";
  const fallbackColors = isDark ? darkColors : colors;
  const fallbackShadows = useMemo(
    () => createShadows(fallbackColors),
    [fallbackColors],
  );

  return (
    context ?? {
      colors: fallbackColors,
      isDark,
      isLoaded: true,
      mode: "system" as ThemeMode,
      scheme: (isDark ? "dark" : "light") as "dark" | "light",
      shadows: fallbackShadows,
      setMode: async () => undefined,
      toggleTheme: async () => undefined,
    }
  );
}

export function useThemeColors() {
  return useTheme().colors;
}

export function useThemeShadows() {
  return useTheme().shadows;
}

export type { ThemeMode };
