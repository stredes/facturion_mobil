import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing, typography } from "../theme";

interface MoneyInputProps {
  label: string;
  value: number;
  error?: string;
  onChangeValue: (value: number) => void;
}

export function MoneyInput({
  label,
  value,
  error,
  onChangeValue,
}: MoneyInputProps) {
  const formattedValue = value
    ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    : "";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <Text style={styles.prefix}>$</Text>
        <TextInput
          accessibilityLabel={label}
          keyboardType="numbers-and-punctuation"
          onChangeText={(text) => {
            const numericValue = parseInt(text.replace(/[^\d]/g, ""), 10) || 0;
            onChangeValue(numericValue);
          }}
          placeholder="0"
          placeholderTextColor={colors.text.tertiary}
          style={styles.input}
          value={formattedValue}
        />
      </View>
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
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  inputWrapper: {
    alignItems: "center",
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: spacing.inputHeight,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  prefix: {
    ...typography.body,
    color: colors.text.tertiary,
    fontWeight: "600",
    marginRight: spacing.xs,
  },
  input: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 0,
    textAlign: "right",
  },
  error: {
    color: colors.status.error,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 5,
  },
});
