import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { typography, useThemeColors, type Colors } from "../theme";

interface AmountRowProps {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "error";
}

export function AmountRow({ label, value, tone = "default" }: AmountRowProps) {
  const colors = useThemeColors();
  const valueColor =
    tone === "default" ? colors.text.primary : colors.status[tone];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row} accessibilityRole="summary" accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]} accessibilityRole="text">{value}</Text>
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    row: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    label: {
      ...typography.label,
      color: c.text.primary,
    },
    value: {
      ...typography.body,
      fontWeight: "600",
    },
  });
