export const springConfig = {
  damping: 15,
  stiffness: 200,
  mass: 0.5,
} as const;

export const durations = {
  base: 220,
} as const;

export const haptics = {
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
} as const;

export type HapticFeedback = (typeof haptics)[keyof typeof haptics];
