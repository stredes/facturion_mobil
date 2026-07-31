import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors, spacing, typography } from "../src/theme";
import { initializeDatabase } from "../src/database/database";
import { ServiceProvider } from "../src/infrastructure/di/ServiceContext";

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
              <ActivityIndicator color={colors.primary.main} size="large" />
              <Text style={styles.loadingText}>Preparando facturas...</Text>
            </>
          )}
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <ServiceProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: colors.background.primary,
            },
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: colors.background.primary,
            },
            headerTitleStyle: {
              color: colors.text.primary,
              fontWeight: "700",
              fontSize: 18,
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
          <Stack.Screen
            name="pagos/general/nueva"
            options={{ title: "Nuevo pago general" }}
          />
          <Stack.Screen
            name="pagos/general/editar/[id]"
            options={{ title: "Editar pago general" }}
          />
          <Stack.Screen
            name="pagos/iva/nueva"
            options={{ title: "Nuevo pago IVA" }}
          />
          <Stack.Screen
            name="pagos/iva/editar/[id]"
            options={{ title: "Editar pago IVA" }}
          />
        </Stack>
      </SafeAreaProvider>
    </ServiceProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: "center",
    backgroundColor: colors.background.primary,
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.xxl,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  error: {
    ...typography.bodyMedium,
    color: colors.status.error,
    textAlign: "center",
  },
});
