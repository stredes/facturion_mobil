import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { radius, spacing, useThemeColors, type Colors } from "../../theme";
import { Skeleton } from "../LoadingSkeleton";

export function MonthlySummarySkeleton() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.skeletonList}>
      {Array.from({ length: 3 }).map((_, index) => (
        <View key={index} style={styles.skeletonMonth}>
          <Skeleton width="50%" height={20} />
          <View style={styles.skeletonGrid}>
            {Array.from({ length: 4 }).map((__, gridIndex) => (
              <View key={gridIndex} style={styles.skeletonCard}>
                <Skeleton width={40} height={12} />
                <Skeleton width="80%" height={22} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    skeletonList: {
      gap: spacing.xl,
    },
    skeletonMonth: {
      gap: spacing.md,
    },
    skeletonGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.gridGap,
    },
    skeletonCard: {
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.card,
      borderWidth: 1,
      flexBasis: "47%",
      flexGrow: 1,
      gap: spacing.xs,
      padding: spacing.cardPadding,
    },
  });
