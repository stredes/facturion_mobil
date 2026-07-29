import { Platform } from "react-native";

const family = Platform.select({
  ios: "System",
  default: "System",
});

export const typography = {
  family,

  mainTitle: {
    fontFamily: family,
    fontSize: 28,
    fontWeight: "700" as const,
    lineHeight: 34,
  },

  sectionTitle: {
    fontFamily: family,
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 26,
  },

  cardTitle: {
    fontFamily: family,
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 24,
  },

  primaryAmount: {
    fontFamily: family,
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 38,
  },

  cardAmount: {
    fontFamily: family,
    fontSize: 22,
    fontWeight: "700" as const,
    lineHeight: 28,
  },

  body: {
    fontFamily: family,
    fontSize: 15,
    fontWeight: "400" as const,
    lineHeight: 22,
  },

  bodyBold: {
    fontFamily: family,
    fontSize: 15,
    fontWeight: "600" as const,
    lineHeight: 22,
  },

  caption: {
    fontFamily: family,
    fontSize: 13,
    fontWeight: "400" as const,
    lineHeight: 18,
  },

  label: {
    fontFamily: family,
    fontSize: 13,
    fontWeight: "600" as const,
    lineHeight: 18,
  },

  small: {
    fontFamily: family,
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
  },
} as const;
