import { StyleSheet, Text } from "react-native";

import { radius, spacing, typography, useThemeColors } from "../theme";
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
  const colors = useThemeColors();
  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: colors.primary.main },
        fullWidth && styles.fullWidth,
        isDisabled && { backgroundColor: colors.text.disabled },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colors.text.inverse },
          isDisabled && { color: colors.text.secondary },
        ]}
      >
        {loading ? "Guardando..." : label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.button,
    minHeight: spacing.buttonHeight,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  fullWidth: {
    width: "100%",
  },
  text: {
    ...typography.bodyMedium,
  },
});
