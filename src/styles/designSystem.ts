// Design System - Coachify
// Material Design 3 based design tokens

export const colors = {
  // Material Design 3 Primary colors
  primary: '#6750a4',
  primaryContainer: '#eaddff',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#21005d',
  
  // Material Design 3 Secondary colors
  secondary: '#625b71',
  secondaryContainer: '#e8def8',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#1d192b',
  
  // Material Design 3 Error colors
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#410002',
  
  // Material Design 3 Success colors (custom)
  success: '#146c43',
  successContainer: '#a7f3d0',
  onSuccess: '#ffffff',
  onSuccessContainer: '#002114',
  
  // Material Design 3 Warning colors (custom)
  warning: '#7f5f01',
  warningContainer: '#fde68a',
  onWarning: '#ffffff',
  onWarningContainer: '#281900',
  
  // Material Design 3 Surface colors
  surface: '#fffbfe',
  surfaceVariant: '#e7e0ec',
  onSurface: '#1c1b1f',
  onSurfaceVariant: '#49454f',
  
  // Material Design 3 Background colors
  background: '#fffbfe',
  onBackground: '#1c1b1f',
  
  // Material Design 3 Outline colors
  outline: '#79747e',
  outlineVariant: '#cab6cf',
  
  // Dark theme colors
  backgroundDark: '#1c1b1f',
  surfaceDark: '#1c1b1f',
  onBackgroundDark: '#e6e1e5',
  onSurfaceDark: '#e6e1e5',
  primaryDark: '#d0bcff',
  onPrimaryDark: '#381e72',
  
  // Legacy support
  border: '#79747e',
  borderDark: '#49454f',
  text: '#1c1b1f',
  textDark: '#e6e1e5',
  textSecondary: '#49454f',
  textSecondaryDark: '#cac4d0',
};

export const typography = {
  // Material Design 3 Typography Scale
  displayLarge: {
    fontSize: 57,
    fontWeight: '400' as const,
    letterSpacing: -0.25,
    lineHeight: 64,
  },
  displayMedium: {
    fontSize: 45,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontSize: 32,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontSize: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontSize: 22,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  
  // Legacy support - mapping to Material Design
  h1: {
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  h2: {
    fontSize: 22,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  h3: {
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 24,
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
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  button: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  buttonSmall: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12, 
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 48,
};

export const borderRadius = {
  // Material Design 3 shape tokens
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 28,
  full: 9999,
};

export const shadows = {
  // Material Design 3 Elevation tokens
  level0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  level4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
  level5: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 12,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
  colored: (color: string, opacity: number = 0.15) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 6,
  }),
};

export const buttonStyles = {
  // Material Design 3 Filled Button
  filled: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 40,
    ...shadows.level1,
  },
  
  // Material Design 3 Filled Tonal Button  
  filledTonal: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: borderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 40,
    ...shadows.level0,
  },
  
  // Material Design 3 Outlined Button
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: borderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 40,
  },
  
  // Material Design 3 Text Button
  text: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 40,
  },
  
  // Material Design 3 Error variants
  filledError: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 40,
    ...shadows.level1,
  },
  
  filledTonalError: {
    backgroundColor: colors.errorContainer,
    borderRadius: borderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 40,
    ...shadows.level0,
  },
  
  // Success variants (custom)
  filledSuccess: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 40,
    ...shadows.level1,
  },
  
  filledTonalSuccess: {
    backgroundColor: colors.successContainer,
    borderRadius: borderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 40,
    ...shadows.level0,
  },
  
  // Small button variants
  small: {
    paddingVertical: 8,
    paddingHorizontal: spacing.lg,
    minHeight: 32,
    borderRadius: borderRadius.lg,
  },
  
  // Legacy support
  primary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 40,
    ...shadows.level1,
  },
  
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: borderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 40,
  },
  
  success: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 40,
    ...shadows.level1,
  },
  
  danger: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 40,
    ...shadows.level1,
  },
  
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 40,
  },
};

export const cardStyles = {
  // Material Design 3 Filled Card
  filled: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0,
    ...shadows.level1,
  },
  
  // Material Design 3 Elevated Card
  elevated: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0,
    ...shadows.level1,
  },
  
  // Material Design 3 Outlined Card
  outlined: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadows.level0,
  },
  
  // Legacy support
  default: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0,
    ...shadows.level1,
  },
  
  premium: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 0,
    ...shadows.level3,
  },
  
  subtle: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0,
    ...shadows.level0,
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

export const tabStyles = {
  container: {
    flexDirection: 'row' as const,
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.lg,
    ...shadows.lg,
  },
  
  button: {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xs,
  },
  
  active: {
    backgroundColor: colors.primaryExtraLight,
  },
  
  icon: {
    fontSize: 20,
    marginBottom: spacing.xs,
    opacity: 0.7,
  },
  
  activeIcon: {
    opacity: 1,
    color: colors.primary,
  },
  
  label: {
    ...typography.caption,
    opacity: 0.7,
  },
  
  activeLabel: {
    ...typography.caption,
    opacity: 1,
    color: colors.primary,
    fontWeight: '500',
  },
};