export const colors = {
  primary: {
    main: "#123B5D",
    light: "#E8F1F7",
    dark: "#0D2A42",
  },
  accent: {
    main: "#2B8C9E",
    light: "#65C7C9",
  },
  background: {
    primary: "#F6F8FA",
    secondary: "#FFFFFF",
    tertiary: "#EEF2F5",
  },
  surface: {
    primary: "#FFFFFF",
    secondary: "#F8FAFC",
    elevated: "#FFFFFF",
  },
  text: {
    primary: "#17212B",
    secondary: "#66727E",
    tertiary: "#8A949E",
    inverse: "#FFFFFF",
    disabled: "#CBD5E1",
  },
  status: {
    success: "#2E8B57",
    warning: "#C78316",
    error: "#C84646",
    info: "#3277A8",
  },
  statusLight: {
    success: "#E7F5EC",
    warning: "#FFF4D8",
    error: "#FDECEC",
    info: "#E8F2F9",
  },
  border: {
    light: "#DDE3E8",
    medium: "#CBD5E1",
    dark: "#8A949E",
  },
  overlay: "rgba(18, 59, 93, 0.4)",
  shadow: "rgba(18, 59, 93, 0.08)",
} as const;

export type Colors = typeof colors;
