import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { spacing, typography, useTheme } from "../src/theme";
import { initializeDatabase } from "../src/database/database";
import { ServiceProvider } from "../src/infrastructure/di/ServiceContext";

export default function RootLayout() {
  const { colors, isDark } = useTheme();
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
        <View
          style={[
            styles.loadingScreen,
            { backgroundColor: colors.background.primary },
          ]}
        >
          {error ? (
            <Text style={[styles.error, { color: colors.status.error }]}>
              {error}
            </Text>
          ) : (
            <>
              <ActivityIndicator color={colors.primary.main} size="large" />
              <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                Preparando facturas...
              </Text>
            </>
          )}
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <ServiceProvider>
      <SafeAreaProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
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
            name="pagos/general/[id]"
            options={{ title: "Detalle de pago general" }}
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
            name="pagos/iva/[id]"
            options={{ title: "Detalle de pago IVA" }}
          />
          <Stack.Screen
            name="pagos/iva/editar/[id]"
            options={{ title: "Editar pago IVA" }}
          />
          <Stack.Screen
            name="retenciones/index"
            options={{ title: "Retenciones" }}
          />
          <Stack.Screen
            name="retenciones/nueva"
            options={{ title: "Nueva retencion" }}
          />
          <Stack.Screen
            name="retenciones/[id]"
            options={{ title: "Detalle de retencion" }}
          />
          <Stack.Screen
            name="retenciones/editar/[id]"
            options={{ title: "Editar retencion" }}
          />
        </Stack>
      </SafeAreaProvider>
    </ServiceProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.xxl,
  },
  loadingText: {
    ...typography.bodyMedium,
  },
  error: {
    ...typography.bodyMedium,
    textAlign: "center",
  },
});
