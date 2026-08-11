import { StyleSheet, Text, View } from "react-native";

import { spacing, typography, useThemeColors } from "../theme";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  largeSubtitle?: boolean;
}

export function AppHeader({ title, subtitle, largeSubtitle }: AppHeaderProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      {subtitle ? (
        <Text
          style={[
            largeSubtitle ? styles.subtitleLarge : styles.subtitle,
            largeSubtitle
              ? { color: colors.primary.main }
              : { color: colors.text.secondary },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxs,
    paddingVertical: spacing.screenPadding,
  },
  title: {
    ...typography.screenTitle,
  },
  subtitle: {
    ...typography.caption,
  },
  subtitleLarge: {
    ...typography.sectionTitle,
  },
});
