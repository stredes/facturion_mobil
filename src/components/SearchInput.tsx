import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { radius, spacing, useThemeColors, type Colors } from "../theme";
import { hapticLight } from "../utils/haptics";

interface SearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** Tiempo de espera (ms) antes de propagar cambios. Por defecto 250. */
  debounceMs?: number;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = "Buscar",
  debounceMs = 250,
}: SearchInputProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  function handleChange(next: string) {
    setDisplayValue(next);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onChangeText(next), debounceMs);
  }

  function handleClear() {
    hapticLight();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDisplayValue("");
    onChangeText("");
  }

  const shownValue = displayValue;

  return (
    <View style={styles.container}>
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.icon}
      >
        {"\u2315"}
      </Text>
      <TextInput
        accessibilityLabel="Buscar"
        accessibilityRole="search"
        returnKeyType="search"
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        style={styles.input}
        value={displayValue}
      />
      {shownValue.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpiar busqueda"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={handleClear}
          style={styles.clearButton}
        >
          <Text style={styles.clearIcon}>{"\u2715"}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.input,
      borderWidth: 1,
      flexDirection: "row",
      gap: spacing.sm,
      minHeight: spacing.inputHeight,
      paddingHorizontal: spacing.md,
    },
    icon: {
      color: c.text.tertiary,
      fontSize: 16,
    },
    input: {
      color: c.text.primary,
      flex: 1,
      fontSize: 15,
      lineHeight: 20,
      minHeight: spacing.inputHeight - 2,
      paddingVertical: 0,
    },
    clearButton: {
      padding: spacing.xxs,
    },
    clearIcon: {
      color: c.text.tertiary,
      fontSize: 14,
      fontWeight: "600",
    },
  });