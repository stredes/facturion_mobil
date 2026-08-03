import { StyleSheet, Text, View } from "react-native";

import { colors, typography } from "../theme";

interface AmountRowProps {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "error";
}

export function AmountRow({ label, value }: AmountRowProps) {
  const valueColor = colors.text.primary;

  return (
    <View style={styles.row} accessibilityRole="summary" accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]} accessibilityRole="text">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    ...typography.label,
    color: colors.text.secondary,
  },
  value: {
    ...typography.body,
    fontWeight: "600",
  },
});
