import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { radius, spacing, typography, useThemeColors, type Colors } from "../theme";
import { hapticMedium } from "../utils/haptics";

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
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      accessibilityRole="alert"
      style={[
        styles.container,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.iconCircle}>
        <Text accessibilityRole="image" style={styles.icon}>
          !
        </Text>
      </View>
      <Text style={styles.title}>Algo salio mal</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          hitSlop={8}
          onPress={() => {
            hapticMedium();
            onRetry();
          }}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryPressed,
          ]}
        >
          <Text style={styles.retryText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      backgroundColor: c.statusLight.error,
      borderColor: c.statusLight.error,
      borderRadius: radius.card,
      borderWidth: 1,
      gap: spacing.md,
      padding: spacing.xxl,
    },
    iconCircle: {
      backgroundColor: c.statusLight.error,
      borderRadius: 24,
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    icon: {
      ...typography.sectionTitle,
      color: c.status.error,
      fontWeight: "700",
    },
    title: {
      ...typography.sectionTitle,
      color: c.status.error,
      textAlign: "center",
    },
    message: {
      ...typography.body,
      color: c.text.secondary,
      textAlign: "center",
    },
    retryButton: {
      alignItems: "center",
      backgroundColor: c.status.error,
      borderRadius: radius.button,
      marginTop: spacing.sm,
      minHeight: 52,
      paddingHorizontal: 28,
      paddingVertical: 12,
      width: "100%",
    },
    retryPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    retryText: {
      ...typography.bodyMedium,
      color: c.text.inverse,
      fontWeight: "700",
    },
  });