import { Stack, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../src/context/AuthContext";

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Mientras se resaura la sesión, no pintamos nada
  if (isLoading) return null;

  // 2. Si no hay sesión, mandamos al login
  if(!isAuthenticated) return <Redirect href="/(auth)/login" />;

  // 3. Deja que expo-router mapee pantallas por archivos (no declares Stack.Screen)
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
    </>
  );
}
