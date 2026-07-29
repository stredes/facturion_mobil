import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, shadows, spacing } from "../theme";

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
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        shadows.fab,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#0A4C6B",
    borderRadius: 28,
    bottom: 24,
    justifyContent: "center",
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
  },
  icon: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 28,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
