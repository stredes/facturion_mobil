import { StyleSheet, Text, View } from "react-native";

import { colors, radius, shadows, spacing, typography } from "../theme";

interface SummaryCardProps {
  label: string;
  value: string;
  icon?: string;
  tone?: "default" | "strong" | "warning" | "error";
  secondary?: string;
}

export function SummaryCard({
  label,
  value,
  icon,
  tone = "default",
  secondary,
}: SummaryCardProps) {
  return (
    <View
      style={[
        styles.card,
        shadows.card,
        tone === "strong" && styles.strongCard,
        tone === "warning" && styles.warningCard,
        tone === "error" && styles.errorCard,
      ]}
    >
      <View style={styles.top}>
        {icon ? (
          <View style={styles.iconBadge}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
        ) : null}
        <Text numberOfLines={1} style={styles.label}>
          {label}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        style={[
          styles.value,
          tone === "strong" && styles.strongValue,
          tone === "warning" && styles.warningValue,
          tone === "error" && styles.errorValue,
        ]}
      >
        {value}
      </Text>
      {secondary ? (
        <Text numberOfLines={1} style={styles.secondary}>
          {secondary}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.card,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 104,
    padding: spacing.cardPadding,
  },
  strongCard: {
    backgroundColor: colors.primary.light,
    borderColor: colors.primary.main,
  },
  warningCard: {
    backgroundColor: colors.statusLight.warning,
    borderColor: colors.status.warning,
  },
  errorCard: {
    backgroundColor: colors.statusLight.error,
    borderColor: colors.status.error,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconBadge: {
    alignItems: "center",
    backgroundColor: colors.primary.light,
    borderRadius: radius.badge,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  icon: {
    fontSize: 14,
    color: colors.primary.main,
  },
  label: {
    ...typography.label,
    color: colors.text.secondary,
    flex: 1,
  },
  value: {
    ...typography.cardAmount,
    color: colors.text.primary,
  },
  strongValue: {
    color: colors.primary.main,
  },
  warningValue: {
    color: colors.status.warning,
  },
  errorValue: {
    color: colors.status.error,
  },
  secondary: {
    ...typography.small,
    color: colors.text.tertiary,
  },
});
