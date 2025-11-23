// app/(app)/dashboard/index.jsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useAuth } from "../../../src/context/AuthContext";
import AppBar from "../../../src/components/AppBar";
import { useTheme } from "../../../src/style/theme"; // ✅ tema dinámico

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme(); // lee el tema activo (light/dark)
  const s = mkStyles(theme); // genera estilos reactivos

  function getInitials(name = "") {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts[parts.length - 1]?.[0] ?? "";
    return (first + last).toUpperCase();
  }

  function Card({ children, style, onPress, testID }) {
    const Comp = onPress ? TouchableOpacity : View;
    const pressProps = onPress
      ? { onPress, activeOpacity: 0.7, accessibilityRole: "button" }
      : {};
    return (
      <Comp style={[s.card, style]} testID={testID} {...pressProps}>
        {children}
      </Comp>
    );
  }

  function MetricCard({ title, value, subtitle, onPress, testID }) {
    return (
      <Card style={s.metric} onPress={onPress} testID={testID}>
        <Text style={s.metricTitle}>{title}</Text>
        <Text style={s.metricValue}>{value}</Text>
        {subtitle ? <Text style={s.metricSubtitle}>{subtitle}</Text> : null}
      </Card>
    );
  }

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  const data = { visitasWeb: 3457, recibidos: 3, enProceso: 0, completados: 0 };

  const goTramites = () => router.push("/(app)/tramites");
  const goPerfil = () => router.push("/(app)/perfil");
  const goSoporte = () => router.push("/(app)/soporte");
  const goAjustes = () => router.push("/(app)/ajustes");

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <AppBar variant="dashboard" showBorder={false} />
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Bienvenida + usuario */}
        <Card style={s.welcomeCard}>
          <Text style={s.h1}>Dashboard de VendoYo.es</Text>
          <Text style={s.subtitle}>
            {greeting}, {user?.name || "Usuario"}.
          </Text>

          <View style={s.userRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>
                {getInitials(user?.name || "VY")}
              </Text>
            </View>
            <View style={s.userMain}>
              <Text style={s.userName}>{user?.name || "Invitado"}</Text>
              <Text style={s.userEmail}>
                {user?.email || "sin-email@vendoyo.es"}
              </Text>
            </View>
            <TouchableOpacity style={s.userAction} onPress={goPerfil}>
              <Text style={s.userActionText}>Ver perfil</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Métricas */}
        <View style={s.grid}>
          <MetricCard
            title="Visitas Web"
            value={data.visitasWeb.toLocaleString("es-ES")}
            onPress={() => {}}
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

        {/* Bloques grandes */}
        <Card style={s.blockSpacing}>
          <Text style={s.blockTitle}>Trámites por Estado</Text>
          <Text style={s.blockHint}>
            Aquí insertaremos un gráfico de barras o donut.
          </Text>
        </Card>

        <Card style={s.blockSpacing}>
          <Text style={s.blockTitle}>Trámites por Conexión</Text>
          <Text style={s.blockHint}>
            Placeholder para un gráfico por plataforma (iOS/Android/Web).
          </Text>
        </Card>

        <Card style={s.blockSpacing}>
          <Text style={s.blockTitle}>Trámites Recibidos Mensuales</Text>
          <Text style={s.blockHint}>
            Aquí irá un gráfico de líneas por meses.
          </Text>
        </Card>

        <Card style={s.blockSpacing}>
          <Text style={s.blockTitle}>Asistente Inteligente de trámites</Text>
          <Text style={s.blockHint}>
            En la próxima iteración conectamos un textarea + botón para generar
            sugerencias.
          </Text>
        </Card>

        {/* Enlaces rápidos */}
        <View style={s.quickLinks}>
          <TouchableOpacity onPress={goTramites} style={s.quickLinkItem}>
            <Text style={s.link}>Ir a trámites</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goSoporte} style={s.quickLinkItem}>
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

/* ---------------- Estilos dependientes del tema ---------------- */
const mkStyles = (theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },

    // Tipografía
    h1: {
      fontSize: theme.font.h2,
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
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow,
    },

    // Welcome card (sobreescribe padding / margin específico)
    welcomeCard: {
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },

    // Usuario
    userRow: {
      marginTop: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.md,
    },
    avatarText: { fontSize: 18, fontWeight: "800", color: theme.colors.text },
    userMain: { flex: 1 },
    userName: {
      fontSize: theme.font.body,
      fontWeight: "700",
      color: theme.colors.text,
    },
    userEmail: { fontSize: theme.font.small, color: theme.colors.textMuted },
    userAction: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.primary,
    },
    userActionText: {
      color: theme.colors.onAccent,
      fontWeight: "700",
      fontSize: theme.font.small,
    },

    // Métricas: usamos percent width + marginBottom para spacing
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    metric: {
      width: "47.5%",
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      marginBottom: theme.spacing.md,
      ...theme.shadow,
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

    // Bloques grandes
    block: {
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      ...theme.shadow,
    },
    blockSpacing: {
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      marginBottom: theme.spacing.lg,
      ...theme.shadow,
    },
    blockTitle: {
      fontSize: theme.font.h3,
      fontWeight: "800",
      color: theme.colors.text,
      marginTop: 4,
    },
    blockHint: { color: theme.colors.textMuted, fontSize: theme.font.small },

    // Links rápidos
    quickLinks: { alignItems: "center", paddingBottom: theme.spacing.xl },
    quickLinkItem: { marginBottom: theme.spacing.sm },
    link: {
      color: theme.colors.primary,
      fontWeight: "700",
      fontSize: theme.font.small,
    },
  });
