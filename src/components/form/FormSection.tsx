import { useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { radius, spacing, springConfig, typography, useThemeColors, type Colors } from "../../theme";

interface FormSectionProps {
  icon: string;
  title: string;
  children: ReactNode;
}

export function FormSection({ icon, title, children }: FormSectionProps) {
  const colors = useThemeColors();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const styles = useMemo(() => createStyles(colors), [colors]);

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
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.blockIcon}
        >
          <Text style={styles.blockIconText}>{icon}</Text>
        </View>
        <Text accessibilityRole="header" style={styles.blockTitle}>
          {title}
        </Text>
      </View>
      {children}
    </Animated.View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
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
      backgroundColor: c.primary.light,
      borderRadius: radius.inner,
      width: spacing.xl + spacing.sm,
      height: spacing.xl + spacing.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    blockIconText: {
      ...typography.label,
      color: c.primary.main,
      fontWeight: "700",
    },
    blockTitle: {
      ...typography.sectionTitle,
      color: c.text.primary,
      flex: 1,
    },
  });
