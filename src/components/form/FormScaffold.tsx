import { useCallback, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import type { Control, FieldValues } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { radius, spacing, typography, useThemeColors, type Colors } from "../../theme";
import { hapticLight } from "../../utils/haptics";
import { AnimatedPressable } from "../AnimatedPressable";
import {
  FormFieldRegistryContext,
  type FormFieldHandle,
} from "./formFieldRegistry";

interface FormScaffoldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  trigger: () => Promise<boolean>;
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

export function FormScaffold<TFieldValues extends FieldValues>({
  control,
  trigger,
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
}: FormScaffoldProps<TFieldValues>) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const orderRef = useRef<string[]>([]);
  const fieldsRef = useRef<Map<string, FormFieldHandle>>(new Map());

  const registerField = useCallback((name: string, handle: FormFieldHandle) => {
    if (!orderRef.current.includes(name)) {
      orderRef.current.push(name);
    }
    fieldsRef.current.set(name, handle);

    return () => {
      fieldsRef.current.delete(name);
      const index = orderRef.current.indexOf(name);
      if (index >= 0) {
        orderRef.current.splice(index, 1);
      }
    };
  }, []);

  const registryValue = useMemo(
    () => ({ register: registerField }),
    [registerField],
  );

  const scrollToFirstError = useCallback((errors: object) => {
    const record = errors as Record<string, { message?: string } | undefined>;
    const name = orderRef.current.find(
      (fieldName) => record[fieldName]?.message,
    );
    if (!name) {
      return;
    }

    const handle = fieldsRef.current.get(name);
    const contentNode = contentRef.current;
    if (!handle || !contentNode) {
      return;
    }

    handle.view.current?.measureLayout(
      contentNode,
      (_x, y) => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, y - spacing.sm),
          animated: true,
        });
      },
      () => undefined,
    );
    handle.focus();
  }, []);

  const handleSubmit = useCallback(async () => {
    hapticLight();
    if (isSubmitting) {
      return;
    }

    const isValid = await trigger();
    if (!isValid) {
      scrollToFirstError(control._formState.errors);
      return;
    }

    onSubmit();
  }, [isSubmitting, trigger, control, scrollToFirstError, onSubmit]);

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

      <FormFieldRegistryContext.Provider value={registryValue}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
          <View ref={contentRef} style={{ gap }}>
            {children}
            <View style={styles.footerSpacer} />
          </View>
        </ScrollView>
      </FormFieldRegistryContext.Provider>

      <View
        style={[
          styles.stickyFooter,
          { paddingBottom: spacing.lg + insets.bottom },
        ]}
      >
        {submitError ? (
          <View accessibilityRole="alert" style={styles.submitErrorBox}>
            <Text style={styles.submitErrorText}>{submitError}</Text>
          </View>
        ) : null}
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityState={{ busy: isSubmitting, disabled: isSubmitting }}
          disabled={isSubmitting}
          hapticOnPress={!isSubmitting}
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.text.inverse} size="small" />
          ) : null}
          <Text
            style={[styles.submitText, isSubmitting && styles.submitTextDisabled]}
          >
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
      gap: spacing.md,
      padding: spacing.lg,
      paddingBottom: spacing.xl,
    },
    submitButton: {
      alignItems: "center",
      backgroundColor: c.primary.main,
      borderRadius: radius.button,
      flexDirection: "row",
      gap: spacing.sm,
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
