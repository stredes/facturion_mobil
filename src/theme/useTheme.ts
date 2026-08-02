import { useColorScheme } from "react-native";

import { colors, darkColors } from "./colors";

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return {
    colors: isDark ? darkColors : colors,
    isDark,
    scheme: (isDark ? "dark" : "light") as "dark" | "light",
  };
}

export function useThemeColors() {
  return useTheme().colors;
}
