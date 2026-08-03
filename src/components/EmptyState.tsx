import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography, useThemeColors, type Colors } from "../theme";
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
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

const createStyles = (c: Colors) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      backgroundColor: c.surface.secondary,
      borderColor: c.border.light,
      borderRadius: radius.card,
      borderWidth: 1,
      gap: spacing.md,
      padding: spacing.xl,
    },
    iconContainer: {
      backgroundColor: c.surface.primary,
      borderRadius: 36,
      padding: spacing.lg,
    },
    icon: {
      fontSize: 26,
      color: c.text.tertiary,
    },
    title: {
      ...typography.sectionTitle,
      color: c.text.primary,
      textAlign: "center",
    },
    message: {
      ...typography.body,
      color: c.text.secondary,
      textAlign: "center",
    },
  });