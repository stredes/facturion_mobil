export const colors = {
  primary: {
    main: "#0A4C6B",
    light: "#5FB4D9",
    dark: "#06374A",
  },
  background: {
    primary: "#F5F7FA",
    secondary: "#FFFFFF",
    tertiary: "#E8ECF1",
  },
  surface: {
    primary: "#FFFFFF",
    secondary: "#F8FAFC",
    elevated: "#FFFFFF",
  },
  text: {
    primary: "#1E293B",
    secondary: "#64748B",
    tertiary: "#94A3B8",
    inverse: "#FFFFFF",
    disabled: "#CBD5E1",
  },
  status: {
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
  statusLight: {
    success: "#F0FFF4",
    warning: "#FFFFF0",
    error: "#FFF5F5",
    info: "#EBF8FF",
  },
  border: {
    light: "#E2E8F0",
    medium: "#CBD5E1",
    dark: "#94A3B8",
  },
  overlay: "rgba(15, 23, 42, 0.5)",
  shadow: "rgba(15, 23, 42, 0.08)",
} as const;

export type Colors = typeof colors;
