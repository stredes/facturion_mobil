import { StyleSheet, Text } from "react-native";

import { colors, radius, spacing, typography } from "../theme";
import { AnimatedPressable } from "./AnimatedPressable";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = true,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, isDisabled && styles.textDisabled]}>
        {loading ? "Guardando..." : label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary.main,
    borderRadius: radius.button,
    minHeight: spacing.buttonHeight,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    backgroundColor: colors.text.disabled,
  },
  text: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
  textDisabled: {
    color: colors.text.tertiary,
  },
});
