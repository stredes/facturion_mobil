import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "../theme";

interface SkeletonProps {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
}

export function Skeleton({
  width = "100%",
  height,
  borderRadius = radius.inner,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityLabel="Cargando contenido"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
      ]}
    />
  );
}

export function InvoiceCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Skeleton width="60%" height={16} />
        <Skeleton width={70} height={14} />
      </View>
      <Skeleton width="45%" height={14} />
      <Skeleton width="35%" height={22} />
      <Skeleton width={60} height={18} borderRadius={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border.light,
  },
  card: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.cardPadding,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
