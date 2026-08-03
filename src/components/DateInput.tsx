import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing } from "../theme";
import { hapticLight } from "../utils/haptics";

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
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={`${label}, formato AAAA-MM-DD`}
        accessibilityState={error ? { invalid: true } : undefined}
        keyboardType="numbers-and-punctuation"
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        onChangeText={onChangeText}
        onFocus={() => {
          setFocused(true);
          hapticLight();
        }}
        placeholder="AAAA-MM-DD"
        placeholderTextColor={colors.text.tertiary}
        returnKeyType="done"
        style={[
          styles.input,
          error && !focused && styles.inputError,
          focused && styles.inputFocused,
        ]}
        value={value}
      />
      {error ? (
        <Text accessibilityLiveRegion="assertive" style={styles.error}>
          {error}
        </Text>
      ) : null}
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
  inputFocused: {
    borderColor: colors.primary.main,
  },
  error: {
    color: colors.status.error,
    fontSize: 12,
    fontWeight: "500",
  },
});
