import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/context/AuthContext";

import { ThemeProvider, useTheme } from "../src/style/theme";

/** Pequeño shell que sí puede usar el hook de theme */
function AppShell() {
  const { theme, mode } = useTheme();

  return (
    <>
      {/* StatusBar acorde al modo actual (texto claro en dark, oscuro en light) */}
      <StatusBar
        style={mode === "dark" ? "light" : "dark"}
        backgroundColor={theme.colors.surface} // Android
        animated
      />

      <Stack
        screenOptions={{
          headerShown: false,
          // Fondo base de todas las pantallas según el tema
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
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
