import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../theme";
import { PrimaryButton } from "./PrimaryButton";

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ICON = "\u2756";

export function EmptyState({
  title = "Sin datos",
  message = "No hay informacion disponible.",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{ICON}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} />
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
    padding: spacing.xl,
  },
  iconContainer: {
    backgroundColor: colors.surface.primary,
    borderRadius: 36,
    padding: spacing.lg,
  },
  icon: {
    fontSize: 26,
    color: colors.text.tertiary,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    textAlign: "center",
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
  },
});
