import { View, Image, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { theme } from "../style/theme";
import { useAuth } from "../context/AuthContext";   // para signOut

// Logo
const LOGO = require("../../assets/images/dashboard/logo_header.png");

/**
 * AppBar global del área autenticada.
 * - Cambia según la ruta:
 *   . En el dashboard: muestra LOGO + botón
 *   . En pantallas internas: muestra <- volver + título de la sección
 * - No añade librerías nuevas. Más adelante conectaremos a un Drawer real.
 */
export default function AppBar() {
    const router = useRouter();
    const pathname = usePathname();
    const { signOut } = useAuth();

    // Detecta si estamos en el "home" autenticado
    const isDashboard =
        pathname === "/(app)/dashboard" || pathname === "/(app)";

    // Deriva un título legible desde la ruta (para pantallas internas)
    const section = pathname.replace(/^\/\((app)\)\//, "").split("/")[0] || "dashboard";
    const TITLES = {
        dashboard: "Dashboard",
        tramites: "Trámites",
        perfil: "Perfil",
        soporte: "Soporte",
        ajustes: "Ajustes",
    };
    const title = TITLES[section] || capitalize(section);

    // Cerrar sesión con confirmación
    const onSignOut = () => {
        Alert.alert(
            "Cerrar sesión",
            "¿Seguro que quieres salir?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Salir",
                    style: "destructive",
                    onPress: async () => {
                        await signOut();     // borra storage + estado
                        router.replace("/");
                    },
                },
            ]
        );
    };

    return (
        <View style={s.wrap}>
            {/* IZQUIERDA: Logo en dashboard / Flecha atras en internas */}
            {isDashboard ? (
                <Image source={LOGO} style={s.logo} resizeMode="contain" />
            ) : (
                <View style={s.leftGroup}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        accessibilityRole="button"
                        accessibilityLabel="Volver"
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Text style={s.backArrow}>←</Text>
                    </TouchableOpacity>
                    <Text style={s.title}>{title}</Text>
                </View>
            )}

            {/* DERECHA: Botón hamburguesa solo en dashboard (placeholder de Drawer/Ajustes) */}
            {isDashboard ? (
                <View style={s.rightGroup}>
                    <TouchableOpacity
                        onPress={() => router.push("/(app)/ajustes")}
                        accessibilityRole="button"
                        accessibilityLabel="Abrir menú"
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Text style={s.hamburger}>☰</Text>
                    </TouchableOpacity>

                    {/* Botón salir */}
                    <TouchableOpacity
                        onPress={onSignOut}
                        accessibilityRole="button"
                        accessibilityLabel="Cerrar sesión"
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Text style={s.signOut}>Salir</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={{ width: 28 }} />
            )}
        </View>
    );
}

function capitalize(str = "") {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const s = StyleSheet.create({
    wrap: {
        height: 64,
        paddingHorizontal: theme.spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.colors.background,
        //sombra sutil
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    // subimos un poco el tamaño del logo para mejorar presencia
    logo: {
        width: 200,
        height: 48
    },
    // grupo izquierda cuando NO es dashboard
    leftGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    backArrow: {
        fontSize: 22,
        fontWeight: "700",
        color: theme.colors.text,
        marginRight: 4,
    },
    title: {
        fontSize: theme.font.base,
        fontWeight: "700",
        color: theme.colors.text,
    },
    // grupo derecha cuando es dashboard
    rightGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    hamburger: {
        fontSize: 26,
        fontWeight: "700",
        color: theme.colors.text,
    },
    signOut: {
        fontSize: theme.font.base,
        fontWeight: "700",
        color: theme.colors.error ?? "#B91C1C",
    },
});