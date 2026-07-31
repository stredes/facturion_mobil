import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing } from "@/theme";
import HomeScreen from "./index";
import FacturasScreen from "./facturas";
import SummaryScreen from "./resumen";
import PagosScreen from "./pagos/index";

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Inicio: "\u2302",
    Facturas: "\u2630",
    Pagos: "\u25CF",
    Resumen: "\u2261",
  };

  return (
    <View style={tabStyles.iconContainer}>
      <Text
        style={[
          tabStyles.icon,
          { color: focused ? colors.primary.main : colors.text.tertiary },
        ]}
      >
        {icons[label] || "\u2022"}
      </Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
  },
  icon: {
    fontSize: 22,
    fontWeight: "700",
  },
});

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.surface.primary,
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
          height: spacing.tabBarHeight + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          color: colors.text.tertiary,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tab.Screen
        name="index"
        component={HomeScreen}
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Inicio" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="facturas"
        component={FacturasScreen}
        options={{
          title: "Facturas",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Facturas" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="pagos"
        component={PagosScreen}
        options={{
          title: "Pagos",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Pagos" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="resumen"
        component={SummaryScreen}
        options={{
          title: "Resumen",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Resumen" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
