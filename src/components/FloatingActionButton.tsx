import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();

  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: colors.primary.main },
        shadows.fab,
        { top: spacing.sm + insets.top },
      ]}
    >
      <Ionicons name={icon} size={24} color={colors.text.inverse} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.fab,
    top: 0,
    justifyContent: "center",
    position: "absolute",
    right: spacing.screenPadding,
    width: 56,
    height: 56,
    zIndex: 10,
  },
});
