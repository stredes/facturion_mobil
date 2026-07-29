import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { initializeDatabase } from "../src/database/database";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDatabase()
      .then(() => setIsReady(true))
      .catch((currentError) => {
        setError(
          currentError instanceof Error
            ? currentError.message
            : "No se pudo inicializar la base de datos",
        );
      });
  }, []);

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingScreen}>
          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <>
              <ActivityIndicator color="#0E7490" size="large" />
              <Text style={styles.loadingText}>Preparando facturas...</Text>
            </>
          )}
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: "#F6F8FA",
          },
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#F6F8FA",
          },
          headerTitleStyle: {
            color: "#102A43",
            fontWeight: "900",
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="facturas/nueva"
          options={{ title: "Nueva factura" }}
        />
        <Stack.Screen
          name="facturas/[id]"
          options={{ title: "Detalle de factura" }}
        />
        <Stack.Screen
          name="facturas/editar/[id]"
          options={{ title: "Editar factura" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: "center",
    backgroundColor: "#F6F8FA",
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    color: "#52606D",
    fontSize: 15,
    fontWeight: "700",
  },
  error: {
    color: "#B91C1C",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
});
