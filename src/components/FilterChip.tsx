import { StyleSheet, Text } from "react-native";

import { colors, radius, spacing, typography } from "../theme";
import { AnimatedPressable } from "./AnimatedPressable";

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      scaleIn={0.95}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.chip,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  selected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  text: {
    ...typography.label,
    color: colors.text.secondary,
  },
  textSelected: {
    color: colors.text.inverse,
  },
});
