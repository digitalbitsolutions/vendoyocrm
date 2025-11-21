// app/(app)/_layout.jsx
import React from "react";
import { Stack, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/style/theme";

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, mode } = useTheme();

  // Mientras se restaura la sesión, no mostramos nada
  if (isLoading) return null;

  // Si no hay sesión, redirigimos al login
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  const barStyle = mode === "dark" ? "light" : "dark";

  return (
    <>
      <StatusBar style={barStyle} backgroundColor={theme.colors.background} />
      
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="ajustes/index" options={{ headerShown: false }} />
        {/* Agrega aquí más pantallas de la sección autenticada */}
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  // Estilos básicos, si son necesarios
});
