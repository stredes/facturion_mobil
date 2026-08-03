import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { radius, spacing, typography, useThemeColors, type Colors } from "../theme";
import {
  formatMoneyInput,
  parseMoneyInput,
} from "../utils/moneyInput";

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
  const [focused, setFocused] = useState(false);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const formattedValue = formatMoneyInput(value);

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
        <Text style={styles.prefix}>$</Text>
        <TextInput
          accessibilityLabel={label}
          keyboardType="numbers-and-punctuation"
          onChangeText={(text) => {
            onChangeValue(parseMoneyInput(text));
          }}
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
          placeholder="0"
          placeholderTextColor={colors.text.tertiary}
          returnKeyType="done"
          style={styles.input}
          value={formattedValue}
        />
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
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    inputError: {
      borderColor: c.status.error,
    },
    inputFocused: {
      borderColor: c.primary.main,
    },
    prefix: {
      ...typography.body,
      color: c.text.tertiary,
      fontWeight: "600",
      marginRight: spacing.xs,
    },
    input: {
      color: c.text.primary,
      flex: 1,
      fontSize: 15,
      lineHeight: 20,
      paddingVertical: 0,
      textAlign: "right",
    },
    error: {
      color: c.status.error,
      fontSize: 12,
      lineHeight: 16,
      marginTop: 5,
    },
  });
