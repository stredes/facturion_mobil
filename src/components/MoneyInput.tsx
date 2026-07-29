import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing, typography } from "../theme";
import { formatCurrency, parseMoneyInput } from "../utils/currency";

interface MoneyInputProps {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
  error?: string;
  readonly?: boolean;
}

export function MoneyInput({
  label,
  value,
  onChangeValue,
  error,
  readonly = false,
}: MoneyInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, readonly ? styles.readonly : null, error ? styles.inputError : null]}>
        <Text style={styles.prefix}>$</Text>
        <TextInput
          accessibilityLabel={label}
          editable={!readonly}
          keyboardType="number-pad"
          onChangeText={(text) => onChangeValue(parseMoneyInput(text))}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, readonly ? styles.readonlyInput : null]}
          value={value > 0 ? formatCurrency(value) : ""}
        />
      </View>
      {readonly ? (
        <Text style={styles.hint}>Calculado automáticamente</Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  inputWrapper: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.input,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: 14,
  },
  readonly: {
    backgroundColor: colors.infoLight,
    borderColor: colors.primaryLight,
  },
  inputError: {
    borderColor: colors.error,
  },
  prefix: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: "600",
    marginRight: spacing.xs,
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 17,
    minHeight: 50,
    paddingVertical: 0,
    textAlign: "right",
  },
  readonlyInput: {
    color: colors.primary,
    fontWeight: "700",
  },
  hint: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: "500",
  },
  error: {
    color: colors.error,
    fontSize: 12,
    fontWeight: "500",
  },
});
