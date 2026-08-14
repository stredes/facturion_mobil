import { Text, TextInput, View } from "react-native";

import { useFieldStyles } from "./fieldStyles";
import {
  formatMoneyInput,
  parseMoneyInput,
} from "../utils/moneyInput";

interface MoneyInputProps {
  label: string;
  value: number;
  error?: string;
  disabled?: boolean;
  onChangeValue: (value: number) => void;
}

export function MoneyInput({
  label,
  value,
  error,
  disabled = false,
  onChangeValue,
}: MoneyInputProps) {
  const { colors, styles, focused, onFocus, onBlur } = useFieldStyles();
  const formattedValue = formatMoneyInput(value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          disabled && { backgroundColor: colors.background.tertiary },
          error && !focused && styles.inputError,
          focused && styles.inputFocused,
        ]}
      >
        <Text style={styles.prefix}>$</Text>
        <TextInput
          accessibilityLabel={label}
          accessibilityState={{ disabled }}
          editable={!disabled}
          keyboardType="numbers-and-punctuation"
          onChangeText={(text) => {
            onChangeValue(parseMoneyInput(text));
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="0"
          placeholderTextColor={colors.text.tertiary}
          returnKeyType="done"
          style={[styles.input, disabled && styles.inputDisabled]}
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
