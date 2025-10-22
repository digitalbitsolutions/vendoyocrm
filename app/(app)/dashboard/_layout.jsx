// -------------------------------------------------------------------------------------
// Drawer SOLO para /dashboard:
// - Se abre desde la DERECHA
// - Overlay atenuado según theme
// - Header del menú con título + botón de CERRAR (X)
// - Items con estado ACTIVO (ruta actual) e iconos consistentes
// -------------------------------------------------------------------------------------

import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Drawer } from "expo-router/drawer";
import { useRouter, usePathname } from "expo-router";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../src/style/theme";
import { useAuth } from "../../../src/context/AuthContext";

// Pequeño helper visual para el "chip" activo
function ActiveDot() {
    return <View style={styles.activeDot} />;
}

// Helper para calcular si un item debe estar activo con precisión
function isActive(pathname, href) {
    if (!pathname || !href) return false;
    return pathname === href || pathname.startsWith(href + "/");
}

// Un ítem de menú con estado activo
function Item ({ icon, label, onPress,active = false }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) =>[
                styles.item,
                active && styles.itemActive,
                pressed && !active && { backgroundColor: "rgba(0,0,0,0.03)" },
                pressed && { opacity: theme.opacity.pressed },
            ]}
            hitSlop={theme.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <View style={styles.itemLeft}>
                {/* Punto activo sutil */}
                {active ? <ActiveDot /> : <View style={{ width: 6 }} />}

                {/* Icono */}
                <Ionicons
                    name={icon}
                    size={22}
                    color={active ? theme.colors.secondary : theme.colors.textMuted}
                    style={{ width: 26, marginLeft: 6 }}
                />
            </View>

            {/* Texto */}
            <Text style={[styles.itemText, active && styles.itemTextActive]}>
                {label}
            </Text>
        </Pressable>
    );
}



// Contenido personalizado del Drawer
function CustomDrawerContent(props) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { signOut } = useAuth();
    const pathname = usePathname();

    const go = (href) => {
        props.navigation?.closeDrawer?.();
        router.push(href);
    };

    // Mapeo de opciones del menú
    const MENU = [
        { icon: "stats-chart",     label: "Dashboard",         href: "/(app)/dashboard" },
        { icon: "briefcase",       label: "Mis Trámites",      href: "/(app)/tramites" },
        { icon: "people",          label: "Clientes",          href: "/(app)/clientes" },
        { icon: "bar-chart",       label: "Reportes",          href: "/(app)/reportes" },
        { icon: "time",            label: "Historial",         href: "/(app)/historial" },
        { icon: "settings",        label: "Configuración",     href: "/(app)/configuracion" },
        { icon: "chatbubbles",     label: "Asistente AI",      href: "/(app)/ai" },
    ];

    return (
        <View style={[styles.drawerRoot, { paddingTop: insets.top }]}>
            {/* Header del panel lateral */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Menú</Text>

                {/* Botón de cerrar (X) */}
                <Pressable
                    onPress={() => props.navigation?.closeDrawer?.()}
                    hitSlop={theme.hitSlop}
                    accessibilityRole="button"
                    accessibilityLabel="Cerrar menú lateral"
                    style={styles.closeBtn}
                >
                    <Ionicons name="close" size={22} color={theme.colors.text} />
                </Pressable>
            </View>

            {/* Lista de opciones */}
            <ScrollView
                contentContainerStyle={[styles.menu, { paddingBottom: insets.bottom + theme.spacing.lg }]}
                showsVerticalScrollIndicator={false}
            >
                {MENU.map((it) => (
                    <Item
                        key={it.href}
                        icon={it.icon}
                        label={it.label}
                        onPress={() => go(it.href)}
                        active={isActive(pathname, it.href)}
                    />
                ))}

                {/* Separador */}
                <View style={{ height: theme.spacing.md }} />

                {/* Cerrar sesión */}
                <Pressable
                    onPress={async () => {
                        props.navigation?.closeDrawer?.();
                        await signOut();
                        router.replace("/(auth)/login");
                    }}
                    style={({ pressed }) => [
                        styles.logoutBtn,
                        pressed && { opacity: theme.opacity.pressed}
                    ]}
                    hitSlop={theme.hitSlop}
                    accessibilityRole="button"
                    accessibilityLabel="Cerrar sesión"
                >
                    <Ionicons name="log-out" size={18} color={theme.colors.danger} />
                    <Text style={styles.logoutText}>Cerrar sesión</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

// Layout del grupo con Drawer
export default function DashboardLayout() {
    return (
        <Drawer
            screenOptions={{
                headerShown: false,
                // Abre desde la DERECHA
                drawerPosition: "right",
                drawerType: "front",
                // Overlay del lado oscuro del tema (semisombra)
                overlayColor: theme.colors.overlay,
                // Panel
                drawerStyle: {
                    width: 280,
                    backgroundColor: theme.colors.surface,
                    borderLeftWidth: 1,
                    borderLeftColor: theme.colors.border,
                },
                // Suaviza la animación al abrir/cerrar
                swipeEdgeWidth: 40,
                // Fondo de la escena detrás del drawer
                sceneContainerStyle: {
                    backgroundColor: theme.colors.background,
                },
            }}
            drawerContent={(p) => <CustomDrawerContent {...p} />}
        >
            {/* Drawer solo envuelve el index del dashboard */}
            <Drawer.Screen name="index" options={{ headerShown: false }} />
        </Drawer>
    );
}

const styles = StyleSheet.create({
    drawerRoot: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },

    // Header del drawer
    header: {
        height: 56,
        paddingHorizontal: theme.spacing.lg,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: {
        fontSize: theme.font.h3,
        fontWeight: "800",
        color: theme.colors.text,
    },
    closeBtn: {
        height: 36,
        width: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        ...(Platform.OS === "ios" ? {} : { overflow: "hidden" }),
    },

    // Contenedor de items
    menu: {
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.lg,
        paddingHorizontal: theme.spacing.md,
        gap: theme.spacing.md,
    },

    // Ítem base
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: theme.radius.lg,
    },
    // Ítem activo
    itemActive: {
        backgroundColor: "rgba(0,0,0,0.04)",
    },
    // Bloque izquierda del ítem (dot + icono)
    itemLeft: {
        flexDirection: "row",
        alignItems: "center",
        width: 36,
    },
    // Punto activo
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.secondary,
        marginRight: 4,
    },
    // Texto
    itemText: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: "700",
    },
    itemTextActive: {
        color: theme.colors.secondary,
    },

    // Botón pill outline para "Cerrar sesión"
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: theme.spacing.lg,
        paddingVertical: 12,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: theme.colors.danger,
        backgroundColor: "transparent",
    },
    logoutText: {
        color: theme.colors.danger,
        fontSize: 15,
        fontWeight: "600",
    },
});
