import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";

import { radius, spacing, typography, useThemeColors, type Colors } from "../theme";
import { hapticSelect } from "../utils/haptics";
import { AnimatedPressable } from "./AnimatedPressable";

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <AnimatedPressable
      accessibilityHint={
        selected
          ? "Seleccionado. Toca para deseleccionar"
          : "Toca para seleccionar"
      }
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      hitSlop={10}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "activate") {
          hapticSelect();
          onPress();
        }
      }}
      onPress={() => {
        hapticSelect();
        onPress();
      }}
      scaleIn={0.95}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    chip: {
      alignItems: "center",
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.chip,
      borderWidth: 1,
      justifyContent: "center",
      margin: spacing.xxs,
      minHeight: spacing.buttonHeight,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
    },
    selected: {
      backgroundColor: c.primary.main,
      borderColor: c.primary.main,
    },
    text: {
      ...typography.label,
      color: c.text.secondary,
    },
    textSelected: {
      color: c.text.inverse,
    },
  });
