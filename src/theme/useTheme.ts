import { useMemo } from "react";
import { useColorScheme } from "react-native";

import { colors, darkColors } from "./colors";
import { createShadows } from "./shadows";

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = isDark ? darkColors : colors;
  const shadows = useMemo(() => createShadows(themeColors), [themeColors]);

  return {
    colors: themeColors,
    shadows,
    isDark,
    scheme: (isDark ? "dark" : "light") as "dark" | "light",
  };
}

export function useThemeColors() {
  return useTheme().colors;
}

export function useThemeShadows() {
  return useTheme().shadows;
}
