import { useEffect, useMemo, useRef, useState } from "react";
import type { Ref } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { radius, spacing, typography, useThemeColors, type Colors } from "../theme";
import { formatMoneyInput, sanitizeMoneyText } from "../utils/moneyInput";

interface MoneyInputProps {
  label: string;
  value: number;
  error?: string;
  inputRef?: Ref<TextInput>;
  onChangeValue: (value: number) => void;
}

export function MoneyInput({
  label,
  value,
  error,
  inputRef,
  onChangeValue,
}: MoneyInputProps) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(() => formatMoneyInput(value));
  const lastSyncedValue = useRef(value);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (focused || value === lastSyncedValue.current) {
      return;
    }
    lastSyncedValue.current = value;
    setText(formatMoneyInput(value));
  }, [value, focused]);

  const handleChange = (raw: string) => {
    const { text: nextText, value: next } = sanitizeMoneyText(raw);
    lastSyncedValue.current = next;
    setText(nextText);
    onChangeValue(next);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          error && !focused && styles.inputError,
          focused && styles.inputFocused,
        ]}
      >
        <TextInput
          accessibilityLabel={`${label}, en pesos chilenos`}
          accessibilityHint={error ? "Campo con error" : undefined}
          aria-invalid={error ? true : false}
          keyboardType="numbers-and-punctuation"
          onChangeText={handleChange}
          onBlur={() => {
            setFocused(false);
            lastSyncedValue.current = value;
            setText(formatMoneyInput(value));
          }}
          onFocus={() => {
            setFocused(true);
          }}
          placeholder="0"
          placeholderTextColor={colors.text.tertiary}
          ref={inputRef}
          returnKeyType="done"
          style={styles.input}
          value={text}
        />
        <Text style={styles.suffix}>$</Text>
      </View>
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
    inputWrapper: {
      alignItems: "center",
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.input,
      borderWidth: 1,
      flexDirection: "row",
      minHeight: spacing.inputHeight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    inputError: {
      borderColor: c.status.error,
    },
    inputFocused: {
      borderColor: c.primary.main,
    },
    input: {
      color: c.text.primary,
      flex: 1,
      fontSize: 15,
      lineHeight: 20,
      paddingVertical: 0,
      textAlign: "right",
    },
    suffix: {
      ...typography.bodyMedium,
      color: c.text.secondary,
      marginLeft: spacing.xs,
    },
    error: {
      color: c.status.error,
      fontSize: 12,
      lineHeight: 16,
      marginTop: spacing.xs,
    },
  });
