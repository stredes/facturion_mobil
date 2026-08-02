import { Easing } from "react-native";

export const springConfig = {
  damping: 15,
  stiffness: 200,
  mass: 0.5,
} as const;

export const durations = {
  fast: 120,
  base: 220,
  slow: 320,
} as const;

export const easing = {
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0, 1, 1),
  decelerate: Easing.bezier(0, 0, 0.2, 1),
} as const;

export const haptics = {
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
} as const;

export type HapticFeedback = (typeof haptics)[keyof typeof haptics];
