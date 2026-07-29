import { StyleSheet, Text } from "react-native";

import { colors, radius, shadows, spacing } from "../theme";
import { AnimatedPressable } from "./AnimatedPressable";

interface FloatingActionButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
  icon?: string;
}

export function FloatingActionButton({
  onPress,
  accessibilityLabel = "Agregar",
  icon = "+",
}: FloatingActionButtonProps) {
  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.button, shadows.fab]}
    >
      <Text style={styles.icon}>{icon}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary.main,
    borderRadius: radius.fab,
    bottom: 24,
    justifyContent: "center",
    position: "absolute",
    right: 24,
    width: 52,
    height: 52,
    zIndex: 10,
  },
  icon: {
    color: colors.text.inverse,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 28,
  },
});
