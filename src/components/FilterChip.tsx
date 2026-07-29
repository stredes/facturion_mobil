import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, spacing } from "../theme";

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function FilterChip({
  label,
  selected,
  onPress,
}: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selected: {
    backgroundColor: "#0A4C6B",
    borderColor: "#0A4C6B",
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
  textSelected: {
    color: "#FFFFFF",
  },
});
