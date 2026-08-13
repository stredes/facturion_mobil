import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing, useThemeColors } from "../theme";

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function ScreenContainer({
  children,
  scrollable = false,
  contentContainerStyle,
  refreshing = false,
  onRefresh,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const content = (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      style={styles.inner}
    >
      <View style={[styles.inner, contentContainerStyle]}>{children}</View>
    </KeyboardAvoidingView>
  );

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.background.primary,
          paddingBottom: insets.bottom,
          paddingTop: insets.top,
        },
      ]}
    >
      {scrollable ? (
        <ScrollView
          alwaysBounceVertical
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          overScrollMode="always"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                colors={[colors.primary.main]}
                refreshing={refreshing}
                tintColor={colors.primary.main}
                onRefresh={onRefresh}
              />
            ) : undefined
          }
          showsVerticalScrollIndicator={false}
        >
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: "padding", default: undefined })}
            style={styles.inner}
          >
            <View style={[styles.inner, contentContainerStyle]}>
              {children}
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
  },
  inner: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.tabBarHeight + spacing.xl,
  },
});
