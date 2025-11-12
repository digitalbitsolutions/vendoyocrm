import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { Hero } from "../src/components/Hero";
import { useAuth } from "../src/context/AuthContext";

// ⏱️ duración mínima del splash (puedes subir/bajar)
const MIN_SPLASH_MS = 1200;

export default function Gate() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const splashStartRef = useRef(Date.now());
  const navTimeoutRef = useRef(null);

  // Cuando cambien los estados de auth, decidimos si navegar
  useEffect(() => {
    if (isLoading) return; // aún cargando auth → no navegamos

    const elapsed = Date.now() - splashStartRef.current;
    const waitMore = Math.max(0, MIN_SPLASH_MS - elapsed);

    // Garantiza que el Hero se vea al menos MIN_SPLASH_MS
    navTimeoutRef.current = setTimeout(() => {
      router.replace(isAuthenticated ? "/(app)" : "/(auth)");
    }, waitMore);

    return () => {
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    };
  }, [isLoading, isAuthenticated, router]);

  // Renderiza únicamente el Hero; SIN ActivityIndicator encima
  return <Hero />;
}
