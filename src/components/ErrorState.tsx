import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../theme";

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
    borderRadius: radius.input,
    borderWidth: 1,
    padding: spacing.lg,
  },
  message: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
