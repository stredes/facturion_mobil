import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius } from "../theme";

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.active : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.label, active ? styles.labelActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.borderLight,
    borderRadius: radius.badge,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  active: {
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  labelActive: {
    color: colors.surface,
  },
});
