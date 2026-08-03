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
        <Skeleton width={70} height={14} borderRadius={radius.badge} />
      </View>
      <Skeleton width="45%" height={14} />
      <Skeleton width="35%" height={22} />
      <Skeleton width={60} height={18} borderRadius={6} />
    </View>
  );
}

export function PaymentCardSkeleton() {
  return (
    <View style={styles.card}>
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
  return (
    <View style={styles.card}>
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
  return (
    <View style={styles.detailScreen}>
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
  return (
    <View style={styles.formScreen}>
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
  return (
    <View style={styles.detailRow}>
      <Skeleton width="30%" height={14} />
      <Skeleton width="40%" height={14} />
    </View>
  );
}

function InputSkeleton() {
  return (
    <View style={styles.formField}>
      <Skeleton width="30%" height={12} />
      <Skeleton width="100%" height={spacing.inputHeight} borderRadius={radius.input} />
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
  detailScreen: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  totalCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.mainCard,
    gap: spacing.sm,
    minHeight: 128,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  detailBlock: {
    gap: spacing.sm,
  },
  detailRow: {
    alignItems: "center",
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  formScreen: {
    gap: spacing.xl,
    padding: spacing.lg,
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
});
