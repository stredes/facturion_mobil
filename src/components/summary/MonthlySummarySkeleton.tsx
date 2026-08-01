import { StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { Skeleton } from "../LoadingSkeleton";

export function MonthlySummarySkeleton() {
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

const styles = StyleSheet.create({
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
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.light,
    borderRadius: radius.card,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: spacing.xs,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
});
