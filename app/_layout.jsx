// app/_layout.jsx
import React, { useMemo } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";

import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { ThemeProvider, useTheme } from "../src/style/theme";

function AppContent() {
  const { theme } = useTheme();
  const { isLoading } = useAuth();

  // sólo en desarrollo — evita logs en producción y elimina la warning de ESLint
  if (__DEV__) {
    console.warn("AppContent - isLoading:", isLoading);
  }

  const s = useMemo(() => mkStyles(theme), [theme]);

  // Si aún estamos cargando, mostramos pantalla de carga simple
  if (isLoading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={s.loadingText}>Cargando aplicación...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar
        style={theme.statusBarStyle}
        backgroundColor={theme.statusBarBg}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: s.stackContent,
          animation: "fade",
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const mkStyles = (theme) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: 10,
      color: theme.colors.text,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    stackContent: {
      backgroundColor: theme.colors.background,
    },
  });
