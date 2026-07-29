export const colors = {
  primary: "#0A4C6B",
  primaryLight: "#5FB4D9",
  primaryDark: "#072E42",

  background: "#F5F7FA",
  surface: "#FFFFFF",

  textPrimary: "#1A202C",
  textSecondary: "#718096",
  textMuted: "#A0AEC0",

  success: "#38A169",
  successLight: "#F0FFF4",
  warning: "#D69E2E",
  warningLight: "#FFFFF0",
  error: "#E53E3E",
  errorLight: "#FFF5F5",
  info: "#3182CE",
  infoLight: "#EBF8FF",

  border: "#E2E8F0",
  borderLight: "#EDF2F7",

  tabActive: "#0A4C6B",
  tabInactive: "#718096",

  skeleton: "#EDF2F7",

  overlay: "rgba(0, 0, 0, 0.4)",
} as const;

export type ColorKey = keyof typeof colors;
