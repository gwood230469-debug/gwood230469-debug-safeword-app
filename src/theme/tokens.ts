export const colors = {
  navy: '#0F2A4A',
  navyDark: '#0A1E38',
  gold: '#B8925A',
  goldLight: '#E8DCC8',
  bg: '#FAF7F2',
  text: '#1A1A1A',
  textMuted: '#6B6459',
  sage: '#4A7A6B',
  sageLight: '#E4EEE9',
  terracotta: '#B85C4A',
  border: '#E7E0D4',
  white: '#FFFFFF',
} as const;

export const typography = {
  fontFamily: undefined, // Inter is loaded via expo-font in App.tsx; falls back to system default until then
  body: 17,
  bodyLarge: 18,
  title: 28,
  subtitle: 20,
  caption: 14,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  card: 24,
  button: 28,
  chip: 20,
} as const;

export const touchTarget = {
  minSize: 44,
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  touchTarget,
} as const;

export type Theme = typeof theme;
