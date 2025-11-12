import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider, useTheme } from "../src/style/theme";

/** Shell que lee el tema y configura navegación + StatusBar */
function AppShell() {
  const { theme } = useTheme();

  return (
    <>
      {/* StatusBar base (AppBar puede sobreescribir en cada pantalla) */}
      <StatusBar
        style={theme.statusBarStyle}          // "light" en dark, "dark" en light
        backgroundColor={theme.statusBarBg}   // usa el bg del tema (coherente con brand)
        animated
      />

      <Stack
        screenOptions={{
          headerShown: false,
          // Fondo de TODAS las pantallas (evita flashes al cambiar de modo)
          contentStyle: { backgroundColor: theme.colors.background },
          // Transición suave entre stacks
          animation: "fade",                  // requiere react-navigation >= 6.x
          gestureEnabled: true,
        }}
      >
        {/* Stacks principales */}
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
