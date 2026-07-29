import { StyleSheet, Text, View } from "react-native";

import { colors, typography } from "../theme";

interface AmountRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function AmountRow({ label, value, highlight }: AmountRowProps) {
  return (
    <View style={[styles.row, highlight && styles.highlighted]}>
      <Text style={[styles.label, highlight && styles.labelHighlight]}>
        {label}
      </Text>
      <Text
        style={[styles.value, highlight && styles.valueHighlight]}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  highlighted: {
    backgroundColor: colors.infoLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  labelHighlight: {
    color: colors.primary,
    fontWeight: "700",
  },
  value: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  valueHighlight: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
});
