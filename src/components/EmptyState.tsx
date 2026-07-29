import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, shadows, spacing, typography } from "../theme";

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  icon = "📭",
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.title, typography.sectionTitle]}>{title}</Text>
      <Text style={[styles.message, typography.body]}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface.secondary,
    borderColor: colors.border.light,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xxl,
  },
  iconContainer: {
    backgroundColor: colors.surface.primary,
    borderRadius: 40,
    padding: spacing.xl,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    color: colors.text.primary,
    textAlign: "center",
  },
  message: {
    color: colors.text.secondary,
    textAlign: "center",
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: "#0A4C6B",
    borderRadius: 8,
    marginTop: spacing.sm,
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
