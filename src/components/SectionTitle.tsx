import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "../theme";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  /** Nivel de encabezado para lectura por voz (1-6). Por defecto 3. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function SectionTitle({
  title,
  subtitle,
  level = 3,
}: SectionTitleProps) {
  return (
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxs,
    marginBottom: spacing.xxs,
  },
  title: {
    color: colors.text.primary,
  },
  subtitle: {
    color: colors.text.tertiary,
  },
});