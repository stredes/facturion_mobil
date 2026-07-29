import { Platform } from "react-native";

export const shadows = Platform.select({
  ios: {
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    elevated: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
    },
    fab: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    modal: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
    },
  },
  default: {
    card: {
      elevation: 1,
    },
    elevated: {
      elevation: 3,
    },
    fab: {
      elevation: 5,
    },
    modal: {
      elevation: 8,
    },
  },
});
