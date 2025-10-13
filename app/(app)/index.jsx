import { Redirect } from "expo-router";

// Pantalla vacía de redirige al dashboard
export default function AppGroupIndex() {
  return <Redirect href="/(app)/dashboard" />;
}