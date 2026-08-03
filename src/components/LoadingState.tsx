import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { spacing, typography, useThemeColors, type Colors } from "../theme";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "large";
}

export function LoadingState({
  message = "Cargando...",
  size = "large",
}: LoadingStateProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      style={[styles.container, styles[size]]}
    >
      <ActivityIndicator color={colors.primary.main} size={size} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
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
      ...typography.caption,
      color: c.text.secondary,
    },
  });
