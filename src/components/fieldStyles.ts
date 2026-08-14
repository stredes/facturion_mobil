import { useMemo, useState } from "react";
import { StyleSheet } from "react-native";

import { radius, spacing, typography, useThemeColors, type Colors } from "../theme";

export function createFieldStyles(c: Colors) {
  return StyleSheet.create({
    container: {
      gap: spacing.xs,
    },
    label: {
      ...typography.label,
      color: c.text.primary,
      marginBottom: spacing.xxs,
    },
    input: {
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.input,
      borderWidth: 1,
      color: c.text.primary,
      fontSize: 15,
      lineHeight: 20,
      minHeight: spacing.inputHeight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    multiline: {
      minHeight: 94,
      textAlignVertical: "top",
    },
    inputWrapper: {
      alignItems: "center",
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.input,
      borderWidth: 1,
      flexDirection: "row",
      minHeight: spacing.inputHeight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    prefix: {
      ...typography.body,
      color: c.text.tertiary,
      fontWeight: "600",
      marginRight: spacing.xs,
    },
    inputError: {
      borderColor: c.status.error,
    },
    inputFocused: {
      borderColor: c.primary.main,
    },
    inputDisabled: {
      backgroundColor: c.background.tertiary,
      color: c.text.disabled,
    },
    error: {
      color: c.status.error,
      fontSize: 12,
      lineHeight: 16,
      marginTop: spacing.xs,
    },
  });
}

/**
 * Hook compartido que unifica el patron de campo (label, focus, error y
 * disabled) para TextInputField, MoneyInput y DateInput.
 */
export function useFieldStyles() {
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);
  const styles = useMemo(() => createFieldStyles(colors), [colors]);

  return {
    colors,
    focused,
    onBlur: () => setFocused(false),
    onFocus: () => setFocused(true),
    styles,
  };
}
