import { StyleSheet, Text } from "react-native";

import { colors, radius, spacing, typography } from "../theme";
import { AnimatedPressable } from "./AnimatedPressable";

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  fullWidth = true,
}: SecondaryButtonProps) {
  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.button,
    borderWidth: 1,
    minHeight: spacing.buttonHeight,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.bodyMedium,
    color: colors.primary.main,
  },
  textDisabled: {
    color: colors.text.tertiary,
  },
});
