import { useMemo, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { radius, spacing, typography, useThemeColors, type Colors } from "../../theme";
import { AnimatedPressable } from "../AnimatedPressable";
import { hapticLight } from "../../utils/haptics";

interface FormScaffoldProps {
  children: ReactNode;
  submitLabel: string;
  isSubmitting: boolean;
  submitError?: string | null;
  onSubmit: () => void;
  gap?: number;
  title?: string;
  subtitle?: string;
  cancelLabel?: string;
  onCancel?: () => void;
}

export function FormScaffold({
  children,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit,
  gap = spacing.lg,
  title,
  subtitle,
  cancelLabel = "Cancelar",
  onCancel,
}: FormScaffoldProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSubmit = () => {
    hapticLight();
    onSubmit();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      style={styles.keyboardView}
    >
      {title ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text accessibilityRole="header" style={styles.headerTitle}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            ) : null}
          </View>
          {onCancel ? (
            <AnimatedPressable
              accessibilityLabel={cancelLabel}
              accessibilityRole="button"
              onPress={onCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </AnimatedPressable>
          ) : null}
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { gap }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
        {submitError ? (
          <View accessibilityRole="alert" style={styles.submitErrorBox}>
            <Text style={styles.submitErrorText}>{submitError}</Text>
          </View>
        ) : null}
        <View style={styles.footerSpacer} />
      </ScrollView>

      <View
        style={[
          styles.stickyFooter,
          { paddingBottom: spacing.lg + insets.bottom },
        ]}
      >
        <AnimatedPressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          hapticOnPress={!isSubmitting}
        >
          <Text style={[styles.submitText, isSubmitting && styles.submitTextDisabled]}>
            {isSubmitting ? "Guardando..." : submitLabel}
          </Text>
        </AnimatedPressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    keyboardView: {
      flex: 1,
    },
    header: {
      alignItems: "center",
      borderBottomColor: c.border.light,
      borderBottomWidth: 1,
      flexDirection: "row",
      gap: spacing.md,
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    headerText: {
      flex: 1,
      gap: spacing.xxs,
      minWidth: 0,
    },
    headerTitle: {
      ...typography.screenTitle,
      color: c.text.primary,
    },
    headerSubtitle: {
      ...typography.caption,
      color: c.text.secondary,
    },
    cancelButton: {
      borderColor: c.border.light,
      borderRadius: radius.button,
      borderWidth: 1,
      minHeight: spacing.buttonHeight,
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    cancelText: {
      ...typography.bodyMedium,
      color: c.text.secondary,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.lg,
    },
    submitErrorBox: {
      backgroundColor: c.statusLight.error,
      borderColor: c.statusLight.error,
      borderRadius: radius.input,
      borderWidth: 1,
      padding: spacing.lg,
    },
    submitErrorText: {
      ...typography.bodyMedium,
      color: c.status.error,
    },
    footerSpacer: {
      height: spacing.xl,
    },
    stickyFooter: {
      backgroundColor: c.surface.primary,
      borderTopColor: c.border.light,
      borderTopWidth: 1,
      padding: spacing.lg,
      paddingBottom: spacing.xl,
    },
    submitButton: {
      alignItems: "center",
      backgroundColor: c.primary.main,
      borderRadius: radius.button,
      minHeight: spacing.buttonHeight,
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
    },
    submitButtonDisabled: {
      backgroundColor: c.text.disabled,
    },
    submitText: {
      ...typography.bodyMedium,
      color: c.text.inverse,
    },
    submitTextDisabled: {
      color: c.text.secondary,
    },
  });
