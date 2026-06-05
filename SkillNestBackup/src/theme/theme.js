import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  background: '#03030e',
  backgroundDark: '#02020a',
  cardBg: 'rgba(0,15,35,0.75)',
  cardBgLight: 'rgba(0,20,45,0.85)',
  primary: '#00e5ff',
  cyan: '#00e5ff',
  cyanDeep: '#0088aa',
  pink: '#ff2d78',
  purple: '#7c3aed',
  purpleLight: '#a855f7',
  green: '#00ff88',
  yellow: '#fbbf24',
  orange: '#f97316',
  red: '#ff4444',
  text: '#d0eeff',
  textDim: '#4a7a99',
  textMuted: '#1a3344',
  border: 'rgba(0,200,255,0.08)',
  borderGlow: 'rgba(0,200,255,0.33)',
  overlay: 'rgba(3,3,14,0.94)',
};

export const SIZES = {
  width,
  height,
  padding: 16,
  margin: 16,
  borderRadius: 12,
  cardBorderRadius: 16,
  iconSize: 24,
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 28,
    xxxl: 36,
  },
};

export const TYPOGRAPHY = {
  fontFamily: 'monospace',
  title: {
    fontFamily: 'monospace',
    letterSpacing: 4,
    fontSize: SIZES.fontSize.xxl,
    fontWeight: 'bold',
  },
  subtitle: {
    fontFamily: 'monospace',
    letterSpacing: 2,
    fontSize: SIZES.fontSize.sm,
  },
  label: {
    fontFamily: 'monospace',
    letterSpacing: 1.5,
    fontSize: SIZES.fontSize.xs,
    textTransform: 'uppercase',
  },
  body: {
    fontFamily: 'monospace',
    fontSize: SIZES.fontSize.md,
  },
};

export const SHADOWS = {
  glow: {
    textShadowColor: COLORS.cyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  glowPink: {
    textShadowColor: COLORS.pink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  glowPurple: {
    textShadowColor: COLORS.purple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
};

export default {
  COLORS,
  SIZES,
  TYPOGRAPHY,
  SHADOWS,
};
