export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screenPadding: 16,
  cardPadding: 16,
  inputHeight: 52,
  buttonHeight: 52,
  buttonHeightSmall: 48,
  headerHeight: 56,
  tabBarHeight: 80,
  cardRadius: 16,
  inputRadius: 8,
  buttonRadius: 8,
  chipRadius: 20,
} as const;

export type Spacing = typeof spacing;
