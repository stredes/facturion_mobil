import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "@/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

const tabIcons: Record<string, { filled: IconName; outline: IconName }> = {
  Inicio: { filled: "home", outline: "home-outline" },
  Facturas: { filled: "document-text", outline: "document-text-outline" },
  Pagos: { filled: "wallet", outline: "wallet-outline" },
  Resumen: { filled: "pie-chart", outline: "pie-chart-outline" },
  Retención: { filled: "file-tray-full", outline: "file-tray-full-outline" },
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const colors = useThemeColors();
  const icons = tabIcons[label] ?? { filled: "add", outline: "add" };

  return (
    <View style={tabStyles.iconContainer}>
      {focused && <View style={[tabStyles.pill, { backgroundColor: colors.primary.light }]} />}
      <Ionicons
        name={focused ? icons.filled : icons.outline}
        size={22}
        color={focused ? colors.primary.main : colors.text.tertiary}
      />
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
  pill: {
    ...StyleSheet.absoluteFillObject,
    alignSelf: "center",
    borderRadius: 18,
    padding: 6,
  },
});

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.surface.primary,
        },
        headerTintColor: colors.primary.main,
        headerTitleStyle: {
          color: colors.text.primary,
          fontSize: 18,
          fontWeight: "700",
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: colors.surface.primary,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: colors.border.light,
          borderTopWidth: 0,
          height: 62 + insets.bottom,
          marginHorizontal: 12,
          marginBottom: 8 + insets.bottom,
          elevation: 8,
          shadowColor: colors.overlay,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarItemStyle: {
          minHeight: 56,
          paddingVertical: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Inicio" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="facturas"
        options={{
          title: "Facturas",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Facturas" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pagos"
        options={{
          title: "Pagos",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Pagos" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="retencion"
        options={{
          title: "Retención",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Retención" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="resumen"
        options={{
          title: "Resumen",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Resumen" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
