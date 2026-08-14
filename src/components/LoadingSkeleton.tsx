import { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { radius, spacing, useThemeColors, type Colors } from "../theme";
import { useReduceMotion } from "../hooks/useReduceMotion";

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
  const colors = useThemeColors();
  const opacity = useRef(new Animated.Value(0.4)).current;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) return;
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
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
      ]}
    />
  );
}

export function InvoiceCardSkeleton() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      accessibilityLabel="Cargando contenido"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.card}
    >
      <View style={styles.row}>
        <Skeleton width="60%" height={16} />
        <Skeleton width={70} height={14} borderRadius={radius.badge} />
      </View>
      <Skeleton width="45%" height={14} />
      <Skeleton width="35%" height={22} />
      <Skeleton width={60} height={18} borderRadius={6} />
    </View>
  );
}

export function PaymentCardSkeleton() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      accessibilityLabel="Cargando contenido"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.card}
    >
      <View style={styles.row}>
        <Skeleton width="40%" height={16} />
        <Skeleton width={80} height={20} borderRadius={radius.badge} />
      </View>
      <Skeleton width="35%" height={12} />
      <Skeleton width="55%" height={12} />
    </View>
  );
}

export function RetentionCardSkeleton() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      accessibilityLabel="Cargando contenido"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.card}
    >
      <View style={styles.row}>
        <Skeleton width="40%" height={16} />
        <Skeleton width={80} height={20} borderRadius={radius.badge} />
      </View>
      <Skeleton width="35%" height={12} />
      <Skeleton width="55%" height={12} />
    </View>
  );
}

export function DetailSkeleton() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      accessibilityLabel="Cargando contenido"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.detailScreen}
    >
      <Skeleton width="55%" height={24} />
      <Skeleton width="75%" height={14} />

      <View style={styles.totalCard}>
        <Skeleton width="35%" height={14} />
        <Skeleton width="60%" height={28} />
      </View>

      <View style={styles.detailBlock}>
        <Skeleton width="40%" height={16} />
        <DetailRowSkeleton />
        <DetailRowSkeleton />
        <DetailRowSkeleton />
      </View>

      <View style={styles.detailBlock}>
        <Skeleton width="40%" height={16} />
        <DetailRowSkeleton />
      </View>

      <Skeleton width="100%" height={spacing.buttonHeight} borderRadius={radius.button} />
    </View>
  );
}

export function FormSkeleton() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      accessibilityLabel="Cargando contenido"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.formScreen}
    >
      <View style={styles.formHeader}>
        <Skeleton width="40%" height={24} />
      </View>

      <View style={styles.formSection}>
        <Skeleton width="45%" height={15} />
        <InputSkeleton />
        <InputSkeleton />
        <InputSkeleton />
      </View>

      <View style={styles.formSection}>
        <Skeleton width="45%" height={15} />
        <InputSkeleton />
        <InputSkeleton />
      </View>

      <Skeleton width="100%" height={spacing.buttonHeight} borderRadius={radius.button} />
    </View>
  );
}

function DetailRowSkeleton() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.detailRow}>
      <Skeleton width="30%" height={14} />
      <Skeleton width="40%" height={14} />
    </View>
  );
}

function InputSkeleton() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.formField}>
      <Skeleton width="30%" height={12} />
      <Skeleton width="100%" height={spacing.inputHeight} borderRadius={radius.input} />
    </View>
  );
}

export function ChartSkeleton({ height = 280, width = 350 }: { height?: number; width?: number }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      accessibilityLabel="Cargando gráfico"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.chartContainer}
    >
      <Skeleton width={width} height={height} borderRadius={radius.card} />
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    skeleton: {
      backgroundColor: c.border.light,
    },
    card: {
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.card,
      borderWidth: 1,
      gap: spacing.sm,
      padding: spacing.cardPadding,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    detailScreen: {
      gap: spacing.lg,
      padding: spacing.screenPadding,
    },
    totalCard: {
      backgroundColor: c.background.tertiary,
      borderRadius: radius.mainCard,
      gap: spacing.sm,
      minHeight: 128,
      justifyContent: "center",
      paddingHorizontal: spacing.cardPadding,
      paddingVertical: spacing.lg,
    },
    detailBlock: {
      gap: spacing.sm,
    },
    detailRow: {
      alignItems: "center",
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.input,
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      padding: spacing.md,
    },
    formScreen: {
      gap: spacing.xl,
      padding: spacing.screenPadding,
    },
    formHeader: {
      gap: spacing.sm,
    },
    formSection: {
      gap: spacing.md,
    },
    formField: {
      gap: spacing.xxs,
    },
    chartContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
  });
