import { Text, TextInput, View, type KeyboardTypeOptions } from "react-native";

import { useFieldStyles } from "./fieldStyles";

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
  disabled?: boolean;
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
  disabled = false,
  onBlur,
  onChangeText,
}: TextInputFieldProps) {
  const { colors, styles, focused, onFocus, onBlur: handleBlur } = useFieldStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityHint={error ? "Campo con error" : undefined}
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        aria-invalid={error ? true : false}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        editable={!disabled}
        keyboardType={keyboardType}
        multiline={multiline}
        onBlur={() => {
          handleBlur();
          onBlur?.();
        }}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        returnKeyType={multiline ? "default" : "done"}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          multiline && styles.multiline,
          disabled && styles.inputDisabled,
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
