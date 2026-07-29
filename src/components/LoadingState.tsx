import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "../theme";

interface LoadingStateProps {
  count?: number;
}

function SkeletonBlock({ style }: { style?: object }) {
  const opacity = useRef(new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity.current, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity.current, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.skeleton, style, { opacity: opacity.current }]}
    />
  );
}

export function LoadingState({ count = 3 }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.card}>
          <SkeletonBlock style={styles.titleLine} />
          <SkeletonBlock style={styles.line} />
          <View style={styles.row}>
            <SkeletonBlock style={styles.amountBlock} />
            <SkeletonBlock style={styles.amountBlock} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  skeleton: {
    backgroundColor: colors.skeleton,
    borderRadius: 4,
  },
  titleLine: {
    height: 20,
    width: "60%",
  },
  line: {
    height: 14,
    width: "40%",
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  amountBlock: {
    flex: 1,
    height: 40,
    borderRadius: radius.input,
  },
});
