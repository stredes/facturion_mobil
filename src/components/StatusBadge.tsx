import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography, useThemeColors, type Colors } from "../theme";

type BadgeVariant = "paid" | "pending" | "registered" | "none";

interface StatusBadgeProps {
  status: BadgeVariant;
  label?: string;
}

function buildBadgeConfig(
  c: Colors,
): Record<BadgeVariant, { label: string; bg: string; text: string; dot: string }> {
  return {
    paid: {
      label: "Pagada",
      bg: c.statusLight.success,
      text: c.text.primary,
      dot: c.status.success,
    },
    pending: {
      label: "Pendiente",
      bg: c.statusLight.warning,
      text: c.text.primary,
      dot: c.status.warning,
    },
    registered: {
      label: "Pago registrado",
      bg: c.statusLight.info,
      text: c.text.primary,
      dot: c.status.info,
    },
    none: {
      label: "Sin fecha de pago",
      bg: c.border.light + "80",
      text: c.text.secondary,
      dot: c.text.tertiary,
    },
  };
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const colors = useThemeColors();
  const config = useMemo(
    () => buildBadgeConfig(colors)[status],
    [colors, status],
  );

  return (
    <View
      accessibilityRole="summary"
      accessibilityLiveRegion="polite"
      accessibilityLabel={label ?? config.label}
      style={[styles.badge, { backgroundColor: config.bg }]}
    >
      <View style={[styles.dot, { backgroundColor: config.dot }]} importantForAccessibility="no-hide-descendants" />
      <Text style={[styles.label, { color: config.text }]}>{label ?? config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.badge,
    flexDirection: "row",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  dot: {
    borderRadius: radius.badge,
    height: 7,
    width: 7,
  },
  label: {
    ...typography.small,
    fontWeight: "600",
  },
});
