import { StyleSheet, Text, View } from "react-native";

import { colors, radius, shadows, spacing, typography } from "../theme";

interface SummaryCardProps {
  label: string;
  value: string;
  icon?: string;
  tone?: "default" | "strong" | "warning";
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
        tone === "strong" ? styles.strongCard : null,
      ]}
    >
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={styles.label}>{label}</Text>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[
          styles.value,
          tone === "strong" ? styles.strongValue : null,
          tone === "warning" ? styles.warningValue : null,
        ]}
      >
        {value}
      </Text>
      {secondary ? (
        <Text style={styles.secondary}>{secondary}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flexBasis: "48%",
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 100,
    padding: spacing.lg,
  },
  strongCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  icon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  value: {
    ...typography.cardAmount,
    color: colors.textPrimary,
  },
  strongValue: {
    color: colors.primary,
  },
  warningValue: {
    color: colors.warning,
  },
  secondary: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
