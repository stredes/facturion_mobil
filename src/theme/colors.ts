export const colors = {
  primary: {
    main: "#123B5D",
    light: "#E8F1F7",
    dark: "#0D2A42",
  },
  background: {
    primary: "#F6F8FA",
    tertiary: "#EEF2F5",
  },
  surface: {
    primary: "#FFFFFF",
    secondary: "#F8FAFC",
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
  },
  series: {
    accountant: "#8B5CF6",
    savings: "#10B981",
  },
  overlay: "rgba(18, 59, 93, 0.4)",
  shadow: "rgba(18, 59, 93, 0.08)",
};

export const darkColors = {
  primary: {
    main: "#5FB4D9",
    light: "#14384F",
    dark: "#3B87B0",
  },
  background: {
    primary: "#0B1220",
    tertiary: "#16202F",
  },
  surface: {
    primary: "#121A29",
    secondary: "#161F30",
  },
  text: {
    primary: "#E8EDF3",
    secondary: "#9AA7B7",
    tertiary: "#64748B",
    inverse: "#0B1220",
    disabled: "#3B4757",
  },
  status: {
    success: "#3FAE74",
    warning: "#E2A53A",
    error: "#E26060",
    info: "#4C8FC0",
  },
  statusLight: {
    success: "rgba(63, 174, 116, 0.18)",
    warning: "rgba(226, 165, 58, 0.18)",
    error: "rgba(226, 96, 96, 0.18)",
    info: "rgba(76, 143, 192, 0.18)",
  },
  border: {
    light: "#1B2433",
    medium: "#26324A",
  },
  series: {
    accountant: "#8B5CF6",
    savings: "#10B981",
  },
  overlay: "rgba(0, 0, 0, 0.5)",
  shadow: "rgba(0, 0, 0, 0.5)",
};

export interface ThemeColors {
  primary: { main: string; light: string; dark: string };
  background: { primary: string; tertiary: string };
  surface: { primary: string; secondary: string };
  text: { primary: string; secondary: string; tertiary: string; inverse: string; disabled: string };
  status: { success: string; warning: string; error: string; info: string };
  statusLight: { success: string; warning: string; error: string; info: string };
  border: { light: string; medium: string };
  series: { accountant: string; savings: string };
  overlay: string;
  shadow: string;
}

export type Colors = ThemeColors;
export type DarkColors = ThemeColors;
