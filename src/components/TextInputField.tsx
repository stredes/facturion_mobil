import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing, typography } from "../theme";

interface TextInputFieldProps {
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  keyboardType?: "default" | "numbers-and-punctuation";
  multiline?: boolean;
  onBlur?: () => void;
  onChangeText: (value: string) => void;
}

export function TextInputField({
  label,
  value,
  error,
  placeholder,
  keyboardType = "default",
  multiline = false,
  onBlur,
  onChangeText,
}: TextInputFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        multiline={multiline}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        onChangeText={onChangeText}
        onFocus={() => {
          setFocused(true);
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        returnKeyType={multiline ? "default" : "done"}
        style={[
          styles.input,
          multiline && styles.multiline,
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
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  input: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 15,
    lineHeight: 20,
    minHeight: spacing.inputHeight,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multiline: {
    minHeight: 94,
    textAlignVertical: "top",
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
    lineHeight: 16,
    marginTop: 5,
  },
});
