import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing } from "../theme";

interface DateInputProps {
  label: string;
  value: string;
  error?: string;
  onBlur?: () => void;
  onChangeText: (value: string) => void;
}

export function DateInput({
  label,
  value,
  error,
  onBlur,
  onChangeText,
}: DateInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType="numbers-and-punctuation"
        onBlur={onBlur}
        onChangeText={onChangeText}
        placeholder="AAAA-MM-DD"
        placeholderTextColor={colors.text.tertiary}
        style={[styles.input, error && styles.inputError]}
        value={value}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 16,
    minHeight: spacing.inputHeight,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  error: {
    color: colors.status.error,
    fontSize: 12,
    fontWeight: "500",
  },
});
