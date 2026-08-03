import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { radius, shadows, spacing, typography, useThemeColors, type Colors } from "../theme";

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
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

const createStyles = (c: Colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.card,
      borderWidth: 1,
      flexBasis: "47%",
      flexGrow: 1,
      gap: spacing.xs,
      minHeight: 104,
      padding: spacing.cardPadding,
    },
    strongCard: {
      backgroundColor: c.primary.light,
      borderColor: c.primary.main,
    },
    warningCard: {
      backgroundColor: c.statusLight.warning,
      borderColor: c.status.warning,
    },
    errorCard: {
      backgroundColor: c.statusLight.error,
      borderColor: c.status.error,
    },
    top: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    iconBadge: {
      alignItems: "center",
      backgroundColor: c.primary.light,
      borderRadius: radius.badge,
      height: 28,
      justifyContent: "center",
      width: 28,
    },
    icon: {
      fontSize: 14,
      color: c.primary.main,
    },
    label: {
      ...typography.label,
      color: c.text.secondary,
      flex: 1,
    },
    value: {
      ...typography.cardAmount,
      color: c.text.primary,
    },
    strongValue: {
      color: c.primary.main,
    },
    warningValue: {
      color: c.status.warning,
    },
    errorValue: {
      color: c.status.error,
    },
    secondary: {
      ...typography.small,
      color: c.text.tertiary,
    },
  });
