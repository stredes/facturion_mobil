import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius } from "../theme";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isDisabled ? styles.disabled : null,
        pressed && !isDisabled ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.text, isDisabled ? styles.textDisabled : null]}>
        {loading ? "Guardando..." : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  disabled: {
    backgroundColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  textDisabled: {
    color: colors.textMuted,
  },
});
