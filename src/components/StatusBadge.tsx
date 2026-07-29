import { StyleSheet, Text, View } from "react-native";

import { colors, radius } from "../theme";

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
    bg: colors.status.success + "20",
    text: colors.status.success,
    dot: colors.status.success,
  },
  pending: {
    label: "Pendiente",
    bg: colors.status.warning + "20",
    text: colors.status.warning,
    dot: colors.status.warning,
  },
  registered: {
    label: "Pago registrado",
    bg: colors.status.info + "20",
    text: colors.status.info,
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
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.label, { color: config.text }]}>
        {label ?? config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.badge,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
