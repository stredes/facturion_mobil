import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../theme";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "large";
}

export function LoadingState({
  message = "Cargando...",
  size = "large",
}: LoadingStateProps) {
  return (
    <View style={[styles.container, styles[size]]}>
      <ActivityIndicator color={colors.primary.main} size={size} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.lg,
  },
  large: {
    paddingVertical: spacing.xxl,
  },
  small: {
    paddingVertical: spacing.lg,
  },
  message: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: "400",
  },
});
