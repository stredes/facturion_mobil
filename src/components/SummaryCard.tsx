import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography, useTheme, type Colors } from "../theme";
import { formatCurrency, formatCurrencyCompact } from "../utils/currency";

interface SummaryCardProps {
  label: string;
  value: number;
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
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isExpanded, setIsExpanded] = useState(false);

  const cardStyle = [
    styles.card,
    shadows.card,
    isExpanded && styles.expandedCard,
    tone === "strong" && styles.strongCard,
    tone === "warning" && styles.warningCard,
    tone === "error" && styles.errorCard,
  ];

  return (
    <Pressable
      accessibilityHint="Toca para ver el monto exacto o contraer"
      accessibilityLabel={`${label}: ${formatCurrency(value)}`}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
      onPress={() => setIsExpanded((prev) => !prev)}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
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
        adjustsFontSizeToFit
        ellipsizeMode="tail"
        minimumFontScale={0.55}
        numberOfLines={1}
        style={[
          styles.value,
          isExpanded && styles.valueExpanded,
          tone === "strong" && styles.strongValue,
          tone === "warning" && styles.warningValue,
          tone === "error" && styles.errorValue,
        ]}
      >
        {isExpanded ? formatCurrency(value) : formatCurrencyCompact(value)}
      </Text>
      {secondary ? (
        <Text numberOfLines={1} style={styles.secondary}>
          {secondary}
        </Text>
      ) : null}
    </Pressable>
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
    expandedCard: {
      minHeight: 140,
    },
    pressed: {
      transform: [{ scale: 0.98 }],
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
    valueExpanded: {
      fontSize: 30,
      lineHeight: 36,
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
