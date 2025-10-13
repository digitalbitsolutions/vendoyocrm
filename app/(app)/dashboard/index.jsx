// --------------------------------------------------------------------------------------
// Pantalla : Dashboard (Home) tras el logiin
// - Muestra saludo + tarjeta de usuario
// - Métrica rápidas en tarjetas
// - Contenedores grandes para charts/listas(placeholders por ahora)
// - Sin dependencias nuevas (nada de icon packs). Todo con tu theme.
// -------------------------------------------------------------------------------------

import { useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useAuth } from "../../../src/context/AuthContext";
import { theme } from "../../../src/style/theme";

// (Opcional) tu logo para el header del dashboard
const LOGO = require("../../../assets/images/dashboard/logo_header.png");

// ------------------------------------------------------------------------------------
// Helpers locales
// ------------------------------------------------------------------------------------

/** Devuelve las iniciales a partir del nombre completo */
function getInitials(name = "") {
    const parts = name.trim().split(/\s+/  );
    const first = parts[0]?.[0] ?? "";
    const last = parts[parts.length - 1]?.[0] ?? "";
    return (first + last).toUpperCase();
}

/** Tarjeta base reutilizable (sombra + borde redondeado) */
function Card({ children, style, onPress, testID }) {
    const Comp = onPress ? TouchableOpacity : View;
    return (
        <Comp style={[s.card, style]} onPress={onPress} activeOpacity={0.7} testID={testID}>
            {children}
        </Comp>
    );
}

/** Tarjeta de métrica (título + valor grande). onPress navega si se pasa. */
function MetricCard ({ title, value, subtitle, onPress, testID }) {
    return (
        <Card style={s.metric} onPress={onPress} testID={testID}>
            <Text style={s.metricTitle}>{title}</Text>
            <Text style={s.metricValue}>{value}</Text>
            {subtitle ? <Text style={s.metricSubtitle}>{subtitle}</Text> : null}
        </Card>
    );
}

// ------------------------------------------------------------------------------------
// Pantalla principal
// ------------------------------------------------------------------------------------
export default function DashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();   // { id, mail, name, role } según tu mock auth.js

    // Saludo dinámico simple
    const greeting = useMemo(() => {
        const h = new Date().getHours();
        if (h < 12) return "Buenos días";
        if (h < 19) return "BUenas tardes";
        return "buenas noches";
    }, []);

    // Datos MOCK por ahora (conecta backend más adelante)
    const data = {
        visitasWeb: 3457,
        recibidos: 3,
        enProceso: 0,
        completados: 0,
    };

    // Navegaciones rápidas (usa tus rutas ya creadas)
    const goTramites = () => router.push("/(app)/tramites");
    const goPerfil   = () => router.push("/(app)/perfil");
    const goSoporte  = () => router.push("/(app)/soporte");
    const goAjustes  = () => router.push("/(app)/ajustes");

    return (
        <SafeAreaView style={s.safe} edges={["top"]}>
            {/* Header App (muy simple). Más adelante meteremos AppBar propia. */}
            <View style={s.appbar}>
                <Image source={LOGO} style={s.logo} resizeMode="contain" />
                {/* Menú hamburguesa (placeholder). En siguiente iteración lo conectamos */}
                <TouchableOpacity onPress={goAjustes} accessibilityLabel="Abrir ajustes">
                    <Text style={s.hamburger}>☰</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={s.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Tarjeta de bienvenida + usuario */}
                <Card style={{ padding: theme.spacing.lg }}>
                    <Text style={s.h1}>Dashboard de VendoYo.es</Text>
                    <Text style={s.subtitle}>{greeting}, {user?.name || "Usuario"}.</Text>
                    
                    <View style={s.userRow}>
                        <View style={s.avatar}>
                            <Text style={s.avatarText}>{getInitials(user?.name || "VY")}</Text>
                        </View>
                        <View style = {{ flex: 1 }}>
                            <Text style={s.userName}>{user?.name || "Invitado"}</Text>
                            <Text style={s.userEmail}>{user?.email || "sin-email@vendoyo.es"}</Text>
                        </View>

                        <TouchableOpacity style={s.userAction} onPress={goPerfil}>
                            <Text style={s.userActionText}>Ver perfil</Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Métrica rápida */}
                <View style={s.grid}>
                    <MetricCard
                        title="Visitas Web"
                        value={data.visitasWeb.toLocaleString("es-ES")}
                        onPress={() => {}}   // futuro: detalle de analytics
                        testID="metric-visitas"
                    />
                    <MetricCard
                        title="Trámites Recibidos"
                        value={data.recibidos}
                        onPress={goTramites}
                        testID="metric-recibidos"
                    />
                    <MetricCard
                        title="Trámites en Proceso"
                        value={data.enProceso}
                        onPress={goTramites}
                        testID="metric-proceso"
                    />
                    <MetricCard
                        title="Trámites Completados"
                        value={data.completados}
                        onPress={goTramites}
                        testID="metric-completados"
                    />
                </View>

                {/* Contenedores grandes (placeholders) */}
                <Card style={s.block}>
                    <Text style={s.blockTitle}>Trámites por Estado</Text>
                    <Text style={s.blockHint}>Aquí insertaremos un gráfico de barras o donut.</Text>
                </Card>

                <Card style={s.block}>
                    <Text style={s.blockTitle}>Trámites por Conexión</Text>
                    <Text style={s.blockHint}>Placeholder para un gráfico por plataforma (iOS/Android/Web).</Text>
                </Card>

                <Card style={s.block}>
                    <Text style={s.blockTitle}>Trámites Recibidos Mensuales</Text>
                    <Text style={s.blockHint}>Aquí irá un grádico de líneas por meses.</Text>
                </Card>

                <Card style={s.block}>
                    <Text style={s.blockTitle}>Asistente Inteligente de trámites</Text>
                    <Text style={s.blockHint}>
                        En la próxima iteración conectamos un textarea + botón para generar sugerencias.
                    </Text>
                </Card>

                {/* Enlaces rápidos abajo */}
                <View style={s.quickLinks}>
                    <TouchableOpacity onPress={goTramites}>
                        <Text style={s.link}>Ir a trámites</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={goSoporte}>
                        <Text style={s.link}>Contactar Soporte</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={goAjustes}>
                        <Text style={s.link}>Ajustes</Text> 
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ------------------------------------------------------------------------------------
// Estilos
// ------------------------------------------------------------------------------------
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    scroll: {
        padding: theme.spacing.lg,
        gap: theme.spacing.lg,
    },

    // AppBar simple
    appbar: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.sm,
        paddingTop: theme.spacing.sm,
        minHeight: 64,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    logo: {
        width: 180,
        height: 56,
    },
    hamburger: {
        fontSize: 28,
        fontWeight: "600",
        color: theme.colors.text,
    },

    // Tipografía
    h1: {
        fontSize:theme.font.h2,
        fontWeight: "600",
        color: theme.colors.text,
    },
    subtitle: {
        marginTop: 4,
        color: theme.colors.textMuted,
        fontSize: theme.font.small,
    },

    // Card base
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.md,
        ...theme.shadow,
    },

    // Usuario
    userRow : {
        marginTop: theme.spacing.md,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "800",
        color: theme.colors.text,
    },
    userName: {
        fontSize: theme.font.body,
        fontWeight: "700",
        color: theme.colors.text,
    },
    userEmail: {
        fontSize: theme.font.small,
        color: theme.colors.textMuted,
    },
    userAction: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.primary,
    },
    userActionText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: theme.font.small,
    },

    // Métricas
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.spacing.md,
    },
    metric: {
        width: "47.5%",
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.md,
    },
    metricTitle: {
        color: theme.colors.textMuted,
        fontSize: theme.font.small,
        marginBottom: 4,
    },
    metricValue: {
        color: theme.colors.text,
        fontWeight: "800",
        fontSize: 32,
        lineHeight: 36,
    },
    metricSubtitle: {
        color: theme.colors.textMuted,
        fontSize: theme.font.small,
        marginTop: 4,
    },

    // Bloquees grandes
    block: {
        padding: theme.spacing.lg,
    },
    blockTitle: {
        fontSize: theme.font.base,
        fontWeight: "800",
        color: theme.colors.text,
        marginTop: 4,
    },
    blockHint: {
        color: theme.colors.textMuted,
        fontSize: theme.font.small,
    },

    // Links rápidos
    quickLinks: {
        alignItems: "center",
        gap: theme.spacing.sm,
        paddingBottom: theme.spacing.xl,
    },
    link: {
        color: theme.colors.primary,
        fontWeight: "700",
        fontSize: theme.font.small,
    },
});