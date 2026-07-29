import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius } from "../theme";

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
}

export function SecondaryButton({ label, onPress }: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.borderLight,
    borderRadius: radius.button,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  pressed: {
    opacity: 0.75,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
});
