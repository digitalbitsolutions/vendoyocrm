import { useEffect, useState, useRef } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../src/context/AuthContext";
import { Hero } from "../src/components/Hero";
import { useTheme } from "../src/style/theme";          

const SPLASH_MS = 2200;

export default function Gate() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();                         
  const [showSplash, setShowSplash] = useState(true);
  const timeoutRef = useRef(null);                      

  useEffect(() => {
    if (isLoading) return;

    // ⏳ mostramos el Hero un ratito y luego decidimos a dónde ir
    timeoutRef.current = setTimeout(() => {
      setShowSplash(false);
      // 🔁 mantenemos tus rutas tal cual
      router.replace(isAuthenticated ? "/(app)" : "/(auth)");
    }, SPLASH_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoading, isAuthenticated, router]);

  // ⌛ Splash + indicador centrado
  if (isLoading || showSplash) {
    return (
      <>
        <Hero />
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
          pointerEvents="none"
          accessibilityLabel="Cargando aplicación"
        >
          <ActivityIndicator size="large" color={theme.colors.secondary} />
        </View>
      </>
    );
  }

  // No renderiza nada: el replace ya cambió de stack
  return null;
}
