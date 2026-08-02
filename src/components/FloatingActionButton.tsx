import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet } from "react-native";

import { radius, shadows, spacing, useThemeColors } from "../theme";
import { AnimatedPressable } from "./AnimatedPressable";

interface FloatingActionButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
}

export function FloatingActionButton({
  onPress,
  accessibilityLabel = "Agregar",
  icon = "add",
}: FloatingActionButtonProps) {
  const colors = useThemeColors();

  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: colors.primary.main },
        shadows.fab,
      ]}
    >
      <Ionicons name={icon} size={28} color={colors.text.inverse} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.fab,
    bottom: spacing.xl,
    justifyContent: "center",
    position: "absolute",
    right: spacing.xl,
    width: 52,
    height: 52,
    zIndex: 10,
  },
});
