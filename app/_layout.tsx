import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { spacing, ThemeProvider, typography, useTheme } from "@/theme";
import { AuthProvider, useAuth } from "@/infrastructure/di/AuthContext";
import { ServiceProvider } from "@/infrastructure/di/ServiceContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootLayoutContent() {
  const { colors, isDark } = useTheme();
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <SafeAreaProvider>
        <View
          accessibilityLabel="Preparando facturas..."
          accessibilityLiveRegion="polite"
          accessibilityRole="progressbar"
          style={[
            styles.loadingScreen,
            { backgroundColor: colors.background.primary },
          ]}
        >
          <ActivityIndicator color={colors.primary.main} size="large" />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            Preparando facturas...
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  const isAuthenticated = user !== null;

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
              backgroundColor: colors.surface.primary,
            },
            headerTintColor: colors.primary.main,
            headerTitleStyle: {
              color: colors.text.primary,
              fontWeight: "700",
              fontSize: 18,
            },
          }}
        >
          <Stack.Protected guard={isAuthenticated}>
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
            <Stack.Screen name="settings" options={{ title: "Ajustes" }} />
          </Stack.Protected>

          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="recover-password" options={{ headerShown: false }} />
          </Stack.Protected>
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
});
