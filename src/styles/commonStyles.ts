// Common Styles - Pre-configured style combinations for quick implementation
import { StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows, buttonStyles, inputStyles, cardStyles, modalStyles, tabStyles } from './designSystem';

export const commonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  darkContainer: {
    backgroundColor: colors.backgroundDark,
  },
  
  // Header styles
  header: {
    padding: spacing.xxl,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 0,
    ...shadows.sm,
  },
  headerWithBorder: {
    padding: spacing.xxl,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  
  // Typography
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  titleLarge: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  // Dark mode text
  darkText: {
    color: colors.textDark,
  },
  darkSubtitle: {
    color: colors.textSecondaryDark,
  },
  
  // Content areas
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xxl,
  },
  
  // Forms
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  // Cards
  card: {
    ...cardStyles.default,
  },
  cardPremium: {
    ...cardStyles.premium,
  },
  cardSubtle: {
    ...cardStyles.subtle,
  },
  
  // Material Design 3 Buttons - Smaller sizes
  buttonPrimary: {
    ...buttonStyles.primary,
    minHeight: 40,
  },
  buttonSecondary: {
    ...buttonStyles.secondary,
    minHeight: 40,
  },
  buttonSuccess: {
    ...buttonStyles.success,
    minHeight: 40,
  },
  buttonDanger: {
    ...buttonStyles.danger,
    minHeight: 40,
  },
  buttonSmall: {
    ...buttonStyles.primary,
    ...buttonStyles.small,
    minHeight: 32,
  },
  buttonGhost: {
    ...buttonStyles.ghost,
    minHeight: 40,
  },
  
  // Material Design 3 specific buttons
  buttonFilled: {
    ...buttonStyles.filled,
  },
  buttonFilledTonal: {
    ...buttonStyles.filledTonal,
  },
  buttonOutlined: {
    ...buttonStyles.outlined,
  },
  buttonTextStyle: {
    ...buttonStyles.text,
  },
  
  // Button text styles
  buttonText: {
    ...typography.button,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  buttonTextSecondary: {
    ...typography.button,
    color: colors.text,
    textAlign: 'center',
  },
  buttonTextSmall: {
    ...typography.buttonSmall,
    color: colors.surface,
    textAlign: 'center',
  },
  
  // Inputs
  input: {
    ...inputStyles.default,
  },
  inputFocused: {
    ...inputStyles.focused,
  },
  inputError: {
    ...inputStyles.error,
  },
  darkInput: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.borderDark,
    color: colors.textDark,
  },
  
  // Search
  searchContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  searchInput: {
    ...inputStyles.default,
    backgroundColor: colors.surface,
  },
  
  // Lists
  listContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  
  // Empty states
  emptyContainer: {
    ...cardStyles.default,
    alignItems: 'center',
    padding: spacing.xxxxl,
    marginTop: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  
  // Material Design 3 Tabs
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceVariant,
    padding: spacing.xs,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    minHeight: 32,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    ...shadows.level1,
  },
  tabButtonText: {
    ...typography.labelMedium,
    color: colors.onSurfaceVariant,
  },
  tabButtonTextActive: {
    ...typography.labelMedium,
    color: colors.onPrimary,
    fontWeight: '500',
  },
  
  // Action buttons row
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  
  // Modals
  modalOverlay: {
    ...modalStyles.overlay,
  },
  modalContent: {
    ...modalStyles.content,
  },
  darkModalContent: {
    backgroundColor: colors.surfaceDark,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  
  // Material Design 3 Status badges - smaller and more refined
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...typography.labelSmall,
    color: colors.onPrimary,
    fontWeight: '500',
  },
  
  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
    minWidth: 80,
  },
  infoValue: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  
  // Safe areas and spacing
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  darkSafeArea: {
    backgroundColor: colors.backgroundDark,
  },
  
  // Shadows
  shadowSm: shadows.sm,
  shadowMd: shadows.md,
  shadowLg: shadows.lg,
  shadowXl: shadows.xl,
  
  // Borders
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  
  // Flex utilities
  flexRow: {
    flexDirection: 'row',
  },
  flexRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Margins and padding
  mt: (size: keyof typeof spacing) => ({ marginTop: spacing[size] }),
  mb: (size: keyof typeof spacing) => ({ marginBottom: spacing[size] }),
  ml: (size: keyof typeof spacing) => ({ marginLeft: spacing[size] }),
  mr: (size: keyof typeof spacing) => ({ marginRight: spacing[size] }),
  mx: (size: keyof typeof spacing) => ({ marginHorizontal: spacing[size] }),
  my: (size: keyof typeof spacing) => ({ marginVertical: spacing[size] }),
  pt: (size: keyof typeof spacing) => ({ paddingTop: spacing[size] }),
  pb: (size: keyof typeof spacing) => ({ paddingBottom: spacing[size] }),
  pl: (size: keyof typeof spacing) => ({ paddingLeft: spacing[size] }),
  pr: (size: keyof typeof spacing) => ({ paddingRight: spacing[size] }),
  px: (size: keyof typeof spacing) => ({ paddingHorizontal: spacing[size] }),
  py: (size: keyof typeof spacing) => ({ paddingVertical: spacing[size] }),
});