import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "../theme";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, typography.sectionTitle]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, typography.caption]}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
    marginBottom: 8,
  },
  title: {
    color: colors.text.primary,
  },
  subtitle: {
    color: colors.text.tertiary,
  },
});
