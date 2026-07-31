import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "../../theme";
import { AnimatedPressable } from "../AnimatedPressable";

interface FormScaffoldProps {
  children: ReactNode;
  submitLabel: string;
  isSubmitting: boolean;
  submitError?: string | null;
  onSubmit: () => void;
  gap?: number;
}

export function FormScaffold({
  children,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit,
  gap = spacing.lg,
}: FormScaffoldProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { gap }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
        {submitError ? (
          <View style={styles.submitErrorBox}>
            <Text style={styles.submitErrorText}>{submitError}</Text>
          </View>
        ) : null}
        <View style={styles.footerSpacer} />
      </ScrollView>

      <View style={styles.stickyFooter}>
        <AnimatedPressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={onSubmit}
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? "Guardando..." : submitLabel}
          </Text>
        </AnimatedPressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.lg,
  },
  submitErrorBox: {
    backgroundColor: colors.statusLight.error,
    borderColor: colors.status.error + "40",
    borderRadius: radius.input,
    borderWidth: 1,
    padding: spacing.lg,
  },
  submitErrorText: {
    ...typography.bodyMedium,
    color: colors.status.error,
  },
  footerSpacer: {
    height: spacing.xl,
  },
  stickyFooter: {
    backgroundColor: colors.surface.primary,
    borderTopColor: colors.border.light,
    borderTopWidth: 1,
    padding: spacing.lg,
    paddingBottom: spacing.lg + 6,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: colors.primary.main,
    borderRadius: radius.button,
    minHeight: spacing.buttonHeight,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  submitButtonDisabled: {
    backgroundColor: colors.text.disabled,
  },
  submitText: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
});
