import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { Text } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { colors, spacing } from "@/theme";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => (
          <AppHeader title="Facturiion" subtitle="Control de tus facturas" />
        ),
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function FacturasStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <AppHeader title="Facturas" subtitle="Todas las facturas" />,
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="FacturasList"
        component={FacturasListScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function HomeScreen() {
  return (
    <ScreenContainer>
      <Text style={{ marginTop: 100 }}>Home Screen - Próximamente</Text>
    </ScreenContainer>
  );
}

function FacturasListScreen() {
  return (
    <ScreenContainer>
      <Text style={{ marginTop: 100 }}>Lista de Facturas - Próximamente</Text>
    </ScreenContainer>
  );
}

export default function TabsLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#0A4C6B",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
          height: 70,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ color, fontSize: size * 1.2, fontWeight: focused ? "700" : "400" }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Facturas"
        component={FacturasStack}
        options={{
          title: "Facturas",
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ color, fontSize: size * 1.2, fontWeight: focused ? "700" : "400" }}>📄</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Resumen"
        component={ResumenStack}
        options={{
          title: "Resumen",
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ color, fontSize: size * 1.2, fontWeight: focused ? "700" : "400" }}>📊</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function ResumenStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <AppHeader title="Resumen" subtitle="Resumen mensual" />,
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="ResumenScreen"
        component={ResumenScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function ResumenScreen() {
  return (
    <ScreenContainer>
      <Text style={{ marginTop: 100 }}>Resumen - Próximamente</Text>
    </ScreenContainer>
  );
}
