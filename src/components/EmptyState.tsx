import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../theme";
import { PrimaryButton } from "./PrimaryButton";

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  iconName?: string;
}

const ICON = "\u2756";

const ICON_GLYPHS: Record<string, string> = {
  "file-tray-outline": "\u2A9A",
  "document-text-outline": "\u2ABB",
  "wallet-outline": "\u29B0",
  "cash-outline": "\u29E9",
  "search": "\u2315",
  "infinite-outline": "\u221E",
  "receipt-outline": "\u29B6",
  "notifications-off-outline": "\u2279",
};

export function EmptyState({
  title = "Sin datos",
  message = "No hay informacion disponible.",
  actionLabel,
  onAction,
  iconName,
}: EmptyStateProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  const glyph = (iconName && ICON_GLYPHS[iconName]) || ICON;

  return (
    <Animated.View
      accessibilityRole="summary"
      style={[
        styles.container,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.iconContainer}>
        <Text accessibilityRole="image" style={styles.icon}>
          {glyph}
        </Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} />
      ) : null}
    </Animated.View>
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