import { Text, TextInput, View } from "react-native";

import { useFieldStyles } from "./fieldStyles";

interface DateInputProps {
  label: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onBlur?: () => void;
  onChangeText: (value: string) => void;
}

export function DateInput({
  label,
  value,
  error,
  disabled = false,
  onBlur,
  onChangeText,
}: DateInputProps) {
  const { colors, styles, focused, onFocus, onBlur: handleBlur } = useFieldStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={`${label}, formato AAAA-MM-DD`}
        accessibilityHint={error ? "Campo con error" : undefined}
        accessibilityState={{ disabled }}
        editable={!disabled}
        keyboardType="numbers-and-punctuation"
        onBlur={() => {
          handleBlur();
          onBlur?.();
        }}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder="AAAA-MM-DD"
        placeholderTextColor={colors.text.tertiary}
        returnKeyType="done"
        style={[
          styles.input,
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
