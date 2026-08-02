import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing } from "../theme";
import { hapticLight } from "../utils/haptics";

interface SearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = "Buscar",
}: SearchInputProps) {
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
        returnKeyType="search"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        style={styles.input}
        value={value}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpiar busqueda"
          hitSlop={8}
          onPress={() => {
            hapticLight();
            onChangeText("");
          }}
          style={styles.clearButton}
        >
          <Text style={styles.clearIcon}>{"\u2715"}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: spacing.inputHeight,
    paddingHorizontal: 14,
  },
  icon: {
    color: colors.text.tertiary,
    fontSize: 16,
  },
  input: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    minHeight: spacing.inputHeight - 2,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    color: colors.text.tertiary,
    fontSize: 14,
    fontWeight: "600",
  },
});
