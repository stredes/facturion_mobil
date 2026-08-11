import { StyleSheet, Text } from "react-native";

import { radius, spacing, typography, useThemeColors } from "../theme";
import { AnimatedPressable } from "./AnimatedPressable";

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  tone?: "default" | "danger";
}

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = true,
  tone = "default",
}: SecondaryButtonProps) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;
  const activeColor =
    tone === "danger" ? colors.status.error : colors.primary.main;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        { borderColor: activeColor },
        fullWidth && styles.fullWidth,
        isDisabled && { borderColor: colors.text.disabled },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: activeColor },
          isDisabled && { color: colors.text.disabled },
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
    borderWidth: 1,
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
