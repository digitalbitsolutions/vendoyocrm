import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../src/style/theme";

export default function AuthLayout() {
  const { theme, mode } = useTheme(); 

  return (
    <>
      {/* StatusBar acorde al tema (texto claro en dark, oscuro en light) */}
      <StatusBar
        style={mode === "dark" ? "light" : "dark"}
        backgroundColor={theme.colors.background} // Android
        animated
      />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {/* Declaramos explícitamente las pantallas del grupo */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forget" />
      </Stack>
    </>
  );
}
