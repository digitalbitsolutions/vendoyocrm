import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// Fondo corporativo fijo (no depende de dark/light)
const BRAND_BG = "#36AAA7";

export default function AuthLayout() {
  return (
    <>
      {/* Barra de estado siempre clara sobre fondo turquesa */}
      <StatusBar style="light" backgroundColor={BRAND_BG} animated />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          // Fondo del grupo auth SIEMPRE turquesa
          contentStyle: { backgroundColor: BRAND_BG },
          // Evita gestos raros hacia atrás en pantallas de auth
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forget" />
      </Stack>
    </>
  );
}
