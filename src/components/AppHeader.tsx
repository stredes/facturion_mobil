import { StyleSheet, Text, View } from "react-native";

import { spacing, typography, useThemeColors } from "../theme";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxs,
    paddingVertical: spacing.cardPadding,
  },
  title: {
    ...typography.screenTitle,
  },
  subtitle: {
    ...typography.caption,
  },
});
