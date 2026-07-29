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
        tone === "strong" && styles.strongCard,
        tone === "warning" && styles.warningCard,
      ]}
    >
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={styles.label}>{label}</Text>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[
          styles.value,
          tone === "strong" && styles.strongValue,
          tone === "warning" && styles.warningValue,
        ]}
      >
        {value}
      </Text>
      {secondary ? <Text style={styles.secondary}>{secondary}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.card,
    borderWidth: 1,
    flexBasis: "48%",
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 100,
    padding: spacing.lg,
  },
  strongCard: {
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  warningCard: {
    borderColor: colors.status.warning,
    borderWidth: 2,
  },
  icon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.text.secondary,
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
  secondary: {
    ...typography.small,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
