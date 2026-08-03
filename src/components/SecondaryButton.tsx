import { StyleSheet, Text } from "react-native";

import { radius, spacing, typography, useThemeColors } from "../theme";
import { AnimatedPressable } from "./AnimatedPressable";

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = true,
}: SecondaryButtonProps) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        { borderColor: colors.primary.main },
        fullWidth && styles.fullWidth,
        isDisabled && { borderColor: colors.text.disabled },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colors.primary.main },
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
