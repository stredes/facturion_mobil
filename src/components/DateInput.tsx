import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { radius, spacing, useThemeColors, type Colors } from "../theme";

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
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={`${label}, formato AAAA-MM-DD`}
        accessibilityHint={error ? "Campo con error" : undefined}
        keyboardType="numbers-and-punctuation"
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        onChangeText={onChangeText}
        onFocus={() => {
          setFocused(true);
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

const createStyles = (c: Colors) =>
  StyleSheet.create({
    container: {
      gap: spacing.xs,
    },
    label: {
      color: c.text.primary,
      fontSize: 14,
      fontWeight: "600",
    },
    input: {
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.input,
      borderWidth: 1,
      color: c.text.primary,
      fontSize: 16,
      minHeight: spacing.inputHeight,
      paddingHorizontal: 14,
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
      fontWeight: "500",
    },
  });
