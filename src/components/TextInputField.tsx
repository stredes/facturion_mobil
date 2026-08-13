import { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from "react-native";

import { radius, spacing, typography, useThemeColors, type Colors } from "../theme";

interface TextInputFieldProps {
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?: "email" | "password" | "name" | "off";
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
  secureTextEntry = false,
  autoCapitalize = "sentences",
  autoComplete = "off",
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
        accessibilityHint={error ? "Campo con error" : undefined}
        accessibilityLabel={label}
        aria-invalid={error ? true : false}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
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
        secureTextEntry={secureTextEntry}
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
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.input,
      borderWidth: 1,
      color: c.text.primary,
      fontSize: 15,
      lineHeight: 20,
      minHeight: spacing.inputHeight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
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
      marginTop: spacing.xs,
    },
  });
