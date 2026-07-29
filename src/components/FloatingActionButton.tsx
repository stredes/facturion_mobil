import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, shadows } from "../theme";

interface FloatingActionButtonProps {
  onPress: () => void;
}

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  return (
    <Pressable
      accessibilityLabel="Nueva factura"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        shadows.fab,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text style={styles.icon}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.fab,
    bottom: 24,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    right: 20,
    width: 56,
  },
  icon: {
    color: colors.surface,
    fontSize: 32,
    fontWeight: "500",
    lineHeight: 34,
  },
  pressed: {
    opacity: 0.85,
  },
});
