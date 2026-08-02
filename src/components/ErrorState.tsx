import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "../theme";
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
    alignItems: "center",
    backgroundColor: colors.status.error,
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
    color: colors.text.inverse,
    fontWeight: "700",
  },
});