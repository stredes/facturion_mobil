import { StyleSheet, View } from "react-native";

import { radius, spacing } from "../../theme";
import { Skeleton } from "../LoadingSkeleton";

export function MonthlySummarySkeleton() {
  return (
    <View style={styles.skeletonList}>
      {Array.from({ length: 3 }).map((_, index) => (
        <View key={index} style={styles.skeletonMonth}>
          <Skeleton width="50%" height={20} />
          <View style={styles.summaryCard}>
            <Skeleton width="35%" height={14} />
            <Skeleton width="60%" height={28} />
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
  summaryCard: {
    borderRadius: radius.card,
    gap: spacing.xxs,
    minHeight: 128,
    justifyContent: "center",
    padding: spacing.cardPadding,
  },
});
