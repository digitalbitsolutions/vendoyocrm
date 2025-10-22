// -------------------------------------------------------------------------------------
// AppBar reutilizavle con 2 variantes:
// - "dashboard": logo (izq) + hamburguesa (der)
// - "section":   flecha atrás + título (ambos a la IZQUIERDA)
// --------------------------------------------------------------------------------------

import React from "react";
import { View, Text, Image, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter, useNavigation, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../style/theme";

// 1. Cargamos el logo
const LOGO = require("../../../assets/images/dashboard/logo-dashboard.webp");

export default function AppBar ({
    variant = "dashboard",     // "dashboard" | "section"
    title= "",                 // Título a mostrar en "section"
    onBack,                    // Acción personalizada al volver
    style,                     // Estilos externos opcionales
}) {
    const router = useRouter();               // Para navegar con expo-router
    const navigation = useNavigation();       // Para abrir Drawer (si existe)
    const pathname = usePathname();           // Por si quieres lógica según ruta

    // 2. función segura para abrir el Drawer (solo existe en Dashboard)
    const openDrawer = () => {
        // navigation.openDrawer solo sxiste cuando esmoas bajo un Drawer Navigator
        if (navigation?.openDrawer) {
            navigation.openDrawer();
        }
    };

    // 3. Acción por defecto al pulsar "volver"
    const handleBack = () => {
        if (onBack) return onBack();           // si te pasan una función , úsala.
        // Por defecto: vuelve a Dashboard.
        router.replace("/(app)/dashboard");
    };

    // 4. Render de la variante "section": flecha + título a la IZQUIERDA
    if (variant === "section") {
        return (
            <View style={[styles.wrap, style]}>
                {/* Botón flecha izquierda */}
                <Pressable
                    onPress={handleBack}
                    hitSlop={theme.hitSlop}
                    accessibilityRole="button"
                    style={styles.left}
                >
                    <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
                    {/* Título pegado a la flecha (alineados a la izquierda) */}
                    <Text numberOfLines={1} style={styles.titleSection}>{title}</Text>
                </Pressable>
                {/* No hay botón derecho en "section" */}
                <View style={{ width: 24 }} />
            </View>
        );
    }

    // 5. Variante "dashboard": logo a la IZQ + hamburguesa a la derecha
    return (
        <View style={[styles.wrap, style]}>
            {/* Logo de la marca (izquierda) */}
            <View style={styles.left}>
                <Image
                    source={LOGO}
                    style={{ width: 140, height: 28 }}
                    resizeMode="contain"
                    accessibilityLabel="VendoYo"
                />
            </View>

            {/* Botón hamburguesa (derecha) */}
            <Pressable
                onPress={openDrawer}
                hitSlop={theme.hitSlop}
                accessibilityRole="button"
                style={styles.rightBtn}
            >
                <Ionicons name="menu" size={24} color={theme.colors.text} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    // Barra contenedora (alto fijo + padding + sombra suave)
    wrap: {
        height: 56,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        ...theme.shadow,
        ...(Platform.OS === "android" ? { elevation: 4 } : null),
    },

    // Lado izquierdo: fila para alinear flecha + título (o el logo solo)
    left: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flexShrink: 1,   // Previene que el título rompa layout
    },

    // Botón derecho (hamburguesa)
    rightBtn: {
        height: 40,
        width: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
    },

    // Título en modo "section"
    titleSection: {
        fontSize: theme.font.h3,
        fontWeight: "700",
        color: theme.colors.text,
        maxWidth: 240,  // evita desbordes en móviles pequeños
    },
});

