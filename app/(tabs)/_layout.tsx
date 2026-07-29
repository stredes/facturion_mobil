import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0E7490",
        tabBarInactiveTintColor: "#627D98",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "800",
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#D9E2EC",
          minHeight: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="facturas" options={{ title: "Facturas" }} />
      <Tabs.Screen name="resumen" options={{ title: "Resumen" }} />
    </Tabs>
  );
}
