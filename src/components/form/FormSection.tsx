import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../../theme";
import { springConfig } from "../../theme";

interface FormSectionProps {
  icon: string;
  title: string;
  children: ReactNode;
  delay?: number;
}

export function FormSection({ icon, title, children, delay = 0 }: FormSectionProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        ...springConfig,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[{ opacity, transform: [{ translateY }] }, styles.block]}
    >
      <View style={styles.blockHeader}>
        <View style={styles.blockIcon}>
          <Text style={styles.blockIconText}>{icon}</Text>
        </View>
        <Text style={styles.blockTitle}>{title}</Text>
      </View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  blockIcon: {
    backgroundColor: colors.primary.light,
    borderRadius: radius.inner,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  blockIconText: {
    ...typography.label,
    color: colors.primary.main,
    fontWeight: "700",
  },
  blockTitle: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    flex: 1,
  },
});
