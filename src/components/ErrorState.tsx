import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../theme";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  message,
  onRetry,
  retryLabel = "Reintentar",
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>Algo salió mal</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    borderColor: "#FECACA",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 24,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    color: "#C2410C",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  message: {
    color: "#9A3412",
    fontSize: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#EF4444",
    borderRadius: 8,
    marginTop: 8,
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
