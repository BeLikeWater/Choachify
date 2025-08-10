// Design System - Coachify
// Material Design 3 based design tokens

export const colors = {
  // 2025 Modern Color Palette - Soft & Vibrant
  primary: '#667eea',
  primaryLight: '#8fa5f3',
  primaryDark: '#4c63d2',
  primaryContainer: '#eef2ff',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#1a202c',
  
  secondary: '#764ba2',
  secondaryLight: '#9575cd',
  secondaryDark: '#5e3a7d',
  secondaryContainer: '#f3e5f5',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#2a1b3d',
  
  accent: '#ff6b6b',
  accentLight: '#ff9999',
  accentDark: '#cc5555',
  accentContainer: '#ffebeb',
  
  // Gradient colors for modern 2025 design
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  gradientAccentStart: '#ff6b6b',
  gradientAccentEnd: '#ffa726',
  
  // Healthcare specific colors
  health: '#4ecdc4',
  healthLight: '#80e0dc',
  healthDark: '#26a69a',
  healthContainer: '#e0f7f6',
  
  // Success colors - softer green
  success: '#51cf66',
  successLight: '#8ce99a',
  successDark: '#40c057',
  successContainer: '#ebfbee',
  onSuccess: '#ffffff',
  onSuccessContainer: '#0d2818',
  
  // Warning colors - warmer orange
  warning: '#ff922b',
  warningLight: '#ffa94d',
  warningDark: '#fd7e14',
  warningContainer: '#fff4e6',
  onWarning: '#ffffff',
  onWarningContainer: '#2b1811',
  
  // Error colors - softer red
  error: '#fa5252',
  errorLight: '#ff8a8a',
  errorDark: '#e03131',
  errorContainer: '#ffebee',
  onError: '#ffffff',
  onErrorContainer: '#2d0a0a',
  
  // Modern neutral palette
  surface: '#ffffff',
  surfaceVariant: '#f8fafc',
  surfaceTint: '#f1f5f9',
  onSurface: '#1e293b',
  onSurfaceVariant: '#64748b',
  
  background: '#fefefe',
  onBackground: '#1a202c',
  
  // Subtle borders and outlines
  outline: '#cbd5e1',
  outlineVariant: '#e2e8f0',
  
  // Dark theme - warmer and softer
  backgroundDark: '#0f172a',
  surfaceDark: '#1e293b',
  surfaceVariantDark: '#334155',
  onBackgroundDark: '#f1f5f9',
  onSurfaceDark: '#e2e8f0',
  primaryDark: '#8fa5f3',
  onPrimaryDark: '#1a202c',
  outlineDark: '#475569',
  outlineVariantDark: '#334155',
  
  // Semantic text colors
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    tertiary: '#94a3b8',
    disabled: '#cbd5e1',
    inverse: '#f1f5f9',
  },
  
  textDark: {
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    disabled: '#64748b',
    inverse: '#1e293b',
  },
  
  // Legacy support
  border: '#e2e8f0',
  borderDark: '#475569',
};

export const typography = {
  // 2025 Modern Typography Scale - Improved readability & spacing
  displayLarge: {
    fontSize: 56,
    fontWeight: '300' as const,
    letterSpacing: -0.5,
    lineHeight: 64,
  },
  displayMedium: {
    fontSize: 44,
    fontWeight: '300' as const,
    letterSpacing: -0.25,
    lineHeight: 52,
  },
  displaySmall: {
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  
  // Improved headline hierarchy
  headlineLarge: {
    fontSize: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.25,
    lineHeight: 40,
  },
  headlineMedium: {
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  
  // Enhanced title styles
  titleLarge: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: 24,
  },
  titleSmall: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  
  // Modern label styles
  labelLarge: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  
  // Enhanced body text for better readability
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.15,
    lineHeight: 26,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.15,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  
  // Modern button typography - refined and smaller
  buttonLarge: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  buttonMedium: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 16,
  },
  buttonSmall: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    lineHeight: 14,
  },
  buttonMicro: {
    fontSize: 10,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
    lineHeight: 12,
  },
  
  // Legacy support - updated with modern values
  h1: {
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.25,
    lineHeight: 36,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.15,
    lineHeight: 26,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  button: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
};

export const spacing = {
  // 2025 Modern Spacing Scale - 8pt grid system
  xs: 4,
  sm: 8,
  md: 16, 
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  xxxxl: 64,
  xxxxxl: 80,
  
  // Semantic spacing
  component: 16,
  section: 32,
  page: 24,
  
  // Legacy support
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  huge: 32,
};

export const borderRadius = {
  // 2025 Modern Border Radius - Softer, more organic shapes
  none: 0,
  xs: 6,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  full: 9999,
  
  // Semantic radius
  button: 12,
  card: 16,
  modal: 24,
  avatar: 9999,
  
  // Legacy support
  small: 8,
  medium: 12,
  large: 16,
};

export const shadows = {
  // 2025 Modern Shadow System - Softer, more natural shadows
  level0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  level2: {
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  level3: {
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  level4: {
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  level5: {
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 12,
  },
  
  // Colored shadows for modern cards
  primary: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  
  success: {
    shadowColor: '#51cf66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  
  error: {
    shadowColor: '#fa5252',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  
  // Legacy support
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  
  colored: (color: string, opacity: number = 0.12) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 16,
    elevation: 6,
  }),
};

export const buttonStyles = {
  // Apple/iOS Inspired Borderless Design - Ultra Clean & Minimal
  
  // Primary button - borderless with soft background
  primary: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 32,
  },
  
  // Secondary - subtle tinted background only
  secondary: {
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 28,
  },
  
  // Subtle - very light tint
  subtle: {
    backgroundColor: 'rgba(102, 126, 234, 0.04)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 28,
  },
  
  // Success button - soft green tint
  success: {
    backgroundColor: 'rgba(81, 207, 102, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 32,
  },
  
  // Error button - soft red tint
  error: {
    backgroundColor: 'rgba(250, 82, 82, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 32,
  },
  
  // Warning button - soft orange tint
  warning: {
    backgroundColor: 'rgba(255, 146, 43, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 32,
  },
  
  // Text button - completely transparent
  text: {
    backgroundColor: 'transparent',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 24,
  },
  
  // Icon button - transparent with subtle hover tint
  icon: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 32,
    minWidth: 32,
  },
  
  // FAB - subtle primary tint (Apple style)
  fab: {
    backgroundColor: 'rgba(102, 126, 234, 0.12)',
    borderRadius: 18,
    padding: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 36,
    minWidth: 36,
  },
  
  // Micro button - ultra minimal
  micro: {
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 24,
    borderRadius: 4,
  },
  
  // Small button - light tint
  small: {
    backgroundColor: 'rgba(102, 126, 234, 0.04)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 28,
    borderRadius: 6,
  },
  
  // Medium - default soft tint
  medium: {
    backgroundColor: 'rgba(102, 126, 234, 0.06)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 32,
    borderRadius: 8,
  },
  
  // Large - slightly more visible tint
  large: {
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 40,
    borderRadius: 10,
  },
  
  // Healthcare - soft teal tint
  health: {
    backgroundColor: 'rgba(78, 205, 196, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 32,
  },
  
  // Legacy Material Design 3 - converted to soft tints
  filled: {
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 32,
  },
  
  filledTonal: {
    backgroundColor: 'rgba(102, 126, 234, 0.04)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 28,
  },
  
  outlined: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 28,
  },
  
  // Legacy aliases - soft tints
  danger: {
    backgroundColor: 'rgba(250, 82, 82, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 32,
  },
  
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 24,
  },
};

export const cardStyles = {
  // 2025 Modern Card Designs
  
  // Default elevated card with soft shadow
  default: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0,
    ...shadows.level2,
  },
  
  // Glass morphism inspired card
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...shadows.level1,
  },
  
  // Subtle tinted card
  subtle: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0,
    ...shadows.level0,
  },
  
  // Premium card with enhanced elevation
  premium: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 0,
    ...shadows.level3,
  },
  
  // Interactive card with hover-like appearance
  interactive: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0,
    ...shadows.level2,
  },
  
  // Outlined minimal card
  outlined: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadows.level0,
  },
  
  // Gradient accent card
  gradient: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0,
    ...shadows.primary,
  },
  
  // Healthcare themed card
  health: {
    backgroundColor: colors.healthContainer,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0,
    ...shadows.level1,
  },
  
  // Patient card specific design
  patient: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0,
    ...shadows.level2,
  },
  
  // Legacy Material Design 3 support
  filled: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0,
    ...shadows.level1,
  },
  
  elevated: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0,
    ...shadows.level2,
  },
};

export const inputStyles = {
  // Material Design 3 Filled Text Field
  filled: {
    backgroundColor: colors.surfaceVariant,
    borderTopLeftRadius: borderRadius.xs,
    borderTopRightRadius: borderRadius.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.onSurfaceVariant,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.bodyLarge.fontSize,
    color: colors.onSurface,
    minHeight: 40,
  },
  
  // Material Design 3 Outlined Text Field
  outlined: {
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.bodyLarge.fontSize,
    backgroundColor: 'transparent',
    color: colors.onSurface,
    minHeight: 40,
  },
  
  // Focus states
  filledFocused: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  
  outlinedFocused: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  // Error states
  filledError: {
    borderBottomColor: colors.error,
  },
  
  outlinedError: {
    borderColor: colors.error,
  },
  
  // Legacy support
  default: {
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.bodyLarge.fontSize,
    backgroundColor: 'transparent',
    color: colors.onSurface,
    minHeight: 40,
  },
  
  focused: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  error: {
    borderColor: colors.error,
  },
};

export const modalStyles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  
  content: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxxl,
    margin: spacing.xxl,
    minWidth: 320,
    maxWidth: '90%',
    ...shadows.xl,
  },
};

// 2025 Modern Gradients
export const gradients = {
  primary: ['#667eea', '#764ba2'],
  primaryVertical: ['#667eea', '#764ba2'],
  primaryHorizontal: ['#667eea', '#764ba2'],
  
  accent: ['#ff6b6b', '#ffa726'],
  accentVertical: ['#ff6b6b', '#ffa726'],
  
  success: ['#51cf66', '#40c057'],
  successVertical: ['#51cf66', '#40c057'],
  
  health: ['#4ecdc4', '#26a69a'],
  healthVertical: ['#4ecdc4', '#26a69a'],
  
  warm: ['#ff922b', '#fd7e14'],
  cool: ['#667eea', '#4ecdc4'],
  sunset: ['#ff6b6b', '#ffa726', '#ff922b'],
  
  // Subtle gradients for backgrounds
  subtle: ['rgba(102, 126, 234, 0.05)', 'rgba(118, 75, 162, 0.05)'],
  surface: ['#fefefe', '#f8fafc'],
  
  // Dark theme gradients
  primaryDark: ['#8fa5f3', '#9575cd'],
  backgroundDark: ['#0f172a', '#1e293b'],
};

// Modern Icon System
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

export const iconStyles = {
  default: {
    fontSize: iconSizes.md,
    color: colors.text.secondary,
  },
  
  primary: {
    fontSize: iconSizes.md,
    color: colors.primary,
  },
  
  secondary: {
    fontSize: iconSizes.md,
    color: colors.secondary,
  },
  
  success: {
    fontSize: iconSizes.md,
    color: colors.success,
  },
  
  error: {
    fontSize: iconSizes.md,
    color: colors.error,
  },
  
  warning: {
    fontSize: iconSizes.md,
    color: colors.warning,
  },
  
  disabled: {
    fontSize: iconSizes.md,
    color: colors.text.disabled,
  },
  
  large: {
    fontSize: iconSizes.xl,
    color: colors.text.secondary,
  },
  
  small: {
    fontSize: iconSizes.sm,
    color: colors.text.secondary,
  },
};

export const tabStyles = {
  container: {
    flexDirection: 'row' as const,
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    ...shadows.level2,
  },
  
  button: {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xs,
  },
  
  active: {
    backgroundColor: colors.primaryContainer,
  },
  
  icon: {
    fontSize: iconSizes.lg,
    marginBottom: spacing.xs,
    opacity: 0.6,
    color: colors.text.secondary,
  },
  
  activeIcon: {
    opacity: 1,
    color: colors.primary,
  },
  
  label: {
    ...typography.labelSmall,
    opacity: 0.6,
    color: colors.text.secondary,
  },
  
  activeLabel: {
    ...typography.labelSmall,
    opacity: 1,
    color: colors.primary,
    fontWeight: '600',
  },
};