import { Platform } from "react-native";

const family = Platform.select({
  ios: "System",
  default: "System",
});

const tabularNums = { fontVariant: ["tabular-nums" as const] };

export const typography = {
  family,

  screenTitle: {
    fontFamily: family,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700" as const,
  },

  sectionTitle: {
    fontFamily: family,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600" as const,
  },

  cardTitle: {
    fontFamily: family,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600" as const,
  },

  primaryAmount: {
    fontFamily: family,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700" as const,
    ...tabularNums,
  },

  cardAmount: {
    fontFamily: family,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "700" as const,
    ...tabularNums,
  },

  body: {
    fontFamily: family,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "400" as const,
  },

  bodyMedium: {
    fontFamily: family,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "500" as const,
  },

  label: {
    fontFamily: family,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600" as const,
  },

  caption: {
    fontFamily: family,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },

  small: {
    fontFamily: family,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "400" as const,
  },

  tabularNums,
} as const;
