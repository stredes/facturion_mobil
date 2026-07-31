import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../theme";

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
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>!</Text>
      </View>
      <Text style={styles.title}>Algo salio mal</Text>
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
    backgroundColor: colors.statusLight.error,
    borderColor: colors.status.error + "40",
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xxl,
  },
  iconCircle: {
    backgroundColor: colors.status.error + "20",
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    ...typography.sectionTitle,
    color: colors.status.error,
    fontWeight: "700",
  },
  title: {
    ...typography.sectionTitle,
    color: colors.status.error,
    textAlign: "center",
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.status.error,
    borderRadius: radius.button,
    marginTop: spacing.sm,
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
});
