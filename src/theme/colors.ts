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
    tertiary: "#69737F",
    inverse: "#FFFFFF",
    disabled: "#CBD5E1",
  },
  status: {
    success: "#23764B",
    warning: "#96600A",
    error: "#BE3D3D",
    info: "#2C6E97",
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
    ivaGenerado: "#0EA5E9",
    ivaPagado: "#22C55E",
    sobrante: "#F97316",
    tac: "#3B82F6",
    contactos: "#A855F7",
    ahorro: "#84CC16",
  },
  chart: {
    axis: "#69737F",
    legend: "#66727E",
    tooltipBg: "#17212B",
    tooltipBorder: "#CBD5E1",
  },
  overlay: "rgba(18, 59, 93, 0.4)",
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
    tertiary: "#8D9AAB",
    inverse: "#0B1220",
    disabled: "#3B4757",
  },
  status: {
    success: "#3FAE74",
    warning: "#E2A53A",
    error: "#E97070",
    info: "#5FA0D0",
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
    accountant: "#A78BFA",
    savings: "#34D399",
    ivaGenerado: "#38BDF8",
    ivaPagado: "#4ADE80",
    sobrante: "#FB923C",
    tac: "#60A5FA",
    contactos: "#C084FC",
    ahorro: "#A3E635",
  },
  chart: {
    axis: "#8D9AAB",
    legend: "#9AA7B7",
    tooltipBg: "#E8EDF3",
    tooltipBorder: "#26324A",
  },
  overlay: "rgba(0, 0, 0, 0.5)",
};

export interface ThemeColors {
  primary: { main: string; light: string; dark: string };
  background: { primary: string; tertiary: string };
  surface: { primary: string; secondary: string };
  text: { primary: string; secondary: string; tertiary: string; inverse: string; disabled: string };
  status: { success: string; warning: string; error: string; info: string };
  statusLight: { success: string; warning: string; error: string; info: string };
  border: { light: string; medium: string };
  series: {
    accountant: string;
    savings: string;
    ivaGenerado: string;
    ivaPagado: string;
    sobrante: string;
    tac: string;
    contactos: string;
    ahorro: string;
  },
  chart: { axis: string; legend: string; tooltipBg: string; tooltipBorder: string };
  overlay: string;
}

export type Colors = ThemeColors;
export type DarkColors = ThemeColors;
