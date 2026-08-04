import { Platform, type ViewStyle } from "react-native";

import { colors, type ThemeColors } from "./colors";

export interface Shadows {
  card: ViewStyle;
  fab: ViewStyle;
  modal: ViewStyle;
}

export function createShadows(themeColors: ThemeColors): Shadows {
  const shadowColor = themeColors.overlay;
  const elevationShadows: Shadows = {
    card: {
      elevation: 2,
    },
    fab: {
      elevation: 6,
    },
    modal: {
      elevation: 10,
    },
  };

  return Platform.select<Shadows>({
    ios: {
      card: {
        shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
      },
      fab: {
        shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      modal: {
        shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
    },
    default: elevationShadows,
  }) ?? elevationShadows;
}

export const shadows = createShadows(colors);
