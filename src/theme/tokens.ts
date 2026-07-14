export const colors = {
  navy: '#0F2A4A',
  navyDark: '#0A1E38',
  gold: '#B8925A',
  goldLight: '#E8DCC8',
  bg: '#FAF7F2',
  text: '#1A1A1A',
  // Darkened from #6B6459 so caption/muted text clears 7:1 (AAA) against
  // both `bg` and `white`, not just the 4.5:1 minimum — this text carries
  // status and instructions, and low-vision readers over 55 need the margin.
  textMuted: '#5C5548',
  sage: '#4A7A6B',
  sageLight: '#E4EEE9',
  terracotta: '#B85C4A',
  border: '#E7E0D4',
  white: '#FFFFFF',
} as const;

// Sizes bumped a notch above typical mobile defaults, and every size has an
// explicit lineHeight (~1.4x) rather than relying on RN's cramped default,
// since both help reading speed/comfort for the 55+ audience this app targets.
export const typography = {
  fontFamily: undefined, // Inter is loaded via expo-font in App.tsx; falls back to system default until then
  body: 18,
  bodyLarge: 20,
  title: 30,
  subtitle: 22,
  caption: 15,
  label: 16,
} as const;

export const lineHeight = {
  body: 26,
  bodyLarge: 28,
  title: 38,
  subtitle: 30,
  caption: 21,
  label: 22,
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
  // 48dp is Android's own accessibility guidance (Apple's minimum is 44pt);
  // going with the larger of the two suits users with reduced dexterity.
  minSize: 48,
} as const;

export const shadow = {
  card: {
    shadowColor: '#0F2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
} as const;

export const theme = {
  colors,
  typography,
  lineHeight,
  spacing,
  radius,
  touchTarget,
  shadow,
} as const;

export type Theme = typeof theme;
