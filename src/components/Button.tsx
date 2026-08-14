import { StyleSheet, Text } from "react-native";

import { radius, spacing, typography, useThemeColors } from "../theme";
import { AnimatedPressable } from "./AnimatedPressable";

export type ButtonVariant = "primary" | "secondary";
export type ButtonTone = "default" | "danger";

export interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  tone?: ButtonTone;
}

export function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = true,
  variant = "primary",
  tone = "default",
}: ButtonProps) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;
  const isPrimary = variant === "primary";
  const activeColor =
    tone === "danger" ? colors.status.error : colors.primary.main;

  return (
    <AnimatedPressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        isPrimary && { backgroundColor: activeColor },
        !isPrimary && { borderColor: activeColor },
        fullWidth && styles.fullWidth,
        isDisabled && {
          backgroundColor: isPrimary ? colors.text.disabled : undefined,
          borderColor: colors.text.disabled,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: isPrimary ? colors.text.inverse : activeColor },
          isDisabled && {
            color: isPrimary ? colors.text.secondary : colors.text.disabled,
          },
        ]}
      >
        {loading ? "Guardando..." : label}
      </Text>
    </AnimatedPressable>
  );
}

export function PrimaryButton(props: Omit<ButtonProps, "variant" | "tone">) {
  return <Button {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} variant="secondary" />;
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
