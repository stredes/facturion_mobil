import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { radius, spacing, typography, useThemeColors, type Colors } from "../theme";

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
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

const createStyles = (c: Colors) =>
  StyleSheet.create({
    container: {
      gap: spacing.xs,
    },
    label: {
      ...typography.label,
      color: c.text.primary,
      marginBottom: spacing.xxs,
    },
    input: {
      ...typography.body,
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.input,
      borderWidth: 1,
      color: c.text.primary,
      minHeight: spacing.inputHeight,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    multiline: {
      minHeight: 94,
      textAlignVertical: "top",
    },
    inputError: {
      borderColor: c.status.error,
    },
    inputFocused: {
      borderColor: c.primary.main,
    },
    error: {
      color: c.status.error,
      fontSize: 12,
      lineHeight: 16,
      marginTop: 5,
    },
  });
