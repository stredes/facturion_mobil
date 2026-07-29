import { StyleSheet, Text, View } from "react-native";

import { colors, typography } from "../theme";

interface AmountRowProps {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "error";
}

export function AmountRow({ label, value, tone = "default" }: AmountRowProps) {
  const valueColor =
    tone === "success"
      ? colors.status.success
      : tone === "warning"
        ? colors.status.warning
      : tone === "error"
        ? colors.status.error
        : colors.text.primary;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
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
