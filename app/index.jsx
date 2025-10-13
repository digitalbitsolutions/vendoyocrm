import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../src/context/AuthContext";
import { Hero } from "../src/components/Hero";

// Tiempo que mostraremos el Hero antes de redirigir
const SPLASH_MS = 2200;

export default function Gate() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        // 1. Esperamos a que el AuthProvider restaure la sesión desde storage
        if (isLoading) return;

        // 2. Mostramos el Hero un ratito y luego redirigimos
        const t = setTimeout(() => {
            setShowSplash(false);
            // 3. Redirigimos y reemplazamos la ruta actual (sin volver atrás)
            router.replace(isAuthenticated ? "/(app)" : "/(auth)");
        }, SPLASH_MS);

        return () => clearTimeout(t);
    }, [isLoading, isAuthenticated, router]);

// 4. Mientras arranca Auth o mientras dura el splash, mostramos tu hero
if (isLoading || showSplash) {
    return (
        <>
            <Hero />
            <View
                style ={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <ActivityIndicator />
            </View>
        </>
    );
}

 return null;
}