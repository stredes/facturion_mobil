import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing } from "../theme";

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
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType="numbers-and-punctuation"
        onChangeText={(text) => {
          const numericValue = parseInt(text.replace(/[^\d]/g, ""), 10) || 0;
          onChangeValue(numericValue);
        }}
        placeholder="$ 0"
        placeholderTextColor={colors.text.tertiary}
        style={[styles.input, error && styles.inputError]}
        value={formattedValue}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 8,
    borderWidth: 1,
    color: "#1E293B",
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
    textAlign: "right",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  error: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "500",
  },
});
