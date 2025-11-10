import { Stack, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../src/context/AuthContext";

import { useTheme } from "../../src/style/theme";

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, mode } = useTheme();

  // Mientras se restaura la sesión, no pintamos nada
  if (isLoading) return null;

  // Si no hay sesión, mandamos al login
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;


  const barStyle = mode === "dark" ? "light" : "dark";

  return (
    <>
      {/* ✅ StatusBar reactiva al tema; en Android puedes opcionalmente fijar backgroundColor */}
      <StatusBar style={barStyle} backgroundColor={theme.colors.surface} />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
    </>
  );
}
