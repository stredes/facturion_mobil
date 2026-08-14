import { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { spacing, typography, useThemeColors, type Colors } from "../theme";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
}

export function SectionTitle({
  title,
  subtitle,
  style,
}: SectionTitleProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.container, style]}>
      <Text
        accessibilityRole="header"
        style={[styles.title, typography.sectionTitle]}
      >
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, typography.caption]}>{subtitle}</Text>
      )}
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    container: {
      gap: spacing.xxs,
      marginBottom: spacing.sm,
    },
    title: {
      color: c.text.primary,
    },
    subtitle: {
      color: c.text.tertiary,
    },
  });