export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  screenPadding: 16,
  cardPadding: 16,
  gridGap: 12,
  inputHeight: 50,
  buttonHeight: 50,
  tabBarHeight: 64,
} as const;

export type Spacing = typeof spacing;
