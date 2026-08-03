import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../theme";

type BadgeVariant = "paid" | "pending" | "registered" | "none";

interface StatusBadgeProps {
  status: BadgeVariant;
  label?: string;
}

const badgeConfig: Record<
  BadgeVariant,
  { label: string; bg: string; text: string; dot: string }
> = {
  paid: {
    label: "Pagada",
    bg: colors.statusLight.success,
    text: colors.text.primary,
    dot: colors.status.success,
  },
  pending: {
    label: "Pendiente",
    bg: colors.statusLight.warning,
    text: colors.text.primary,
    dot: colors.status.warning,
  },
  registered: {
    label: "Pago registrado",
    bg: colors.statusLight.info,
    text: colors.text.primary,
    dot: colors.status.info,
  },
  none: {
    label: "Sin fecha de pago",
    bg: colors.border.light + "80",
    text: colors.text.secondary,
    dot: colors.text.tertiary,
  },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = badgeConfig[status];

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
