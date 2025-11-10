// app/(app)/ajustes/index.jsx
import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AppBar from "../../../src/components/AppBar";
import { useTheme } from "../../../src/style/theme";
import { Button } from "../../../src/components/Button";
import { getSettings, saveSettings } from "../../../src/services/settings";

/* ---------- Helpers UI: fila con icono + título + subtítulo + chevron ---------- */
function Row({ icon, title, subtitle, onPress }) {
  const { theme } = useTheme();
  const r = stylesRow(theme);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? theme.opacity?.pressed ?? 0.6 : 1 }]}
      accessibilityRole="button"
    >
      <View style={r.wrap}>
        <View style={r.iconWrap}>
          <Ionicons name={icon} size={18} color={theme.colors.secondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={r.title}>{title}</Text>
          {!!subtitle && <Text style={r.subtitle}>{subtitle}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </View>
    </Pressable>
  );
}

/* ---------- Helpers UI: fila con switch ---------- */
function SwitchRow({ icon, title, subtitle, value, onValueChange, testID }) {
  const { theme } = useTheme();
  const r = stylesRow(theme);
  return (
    <View style={r.wrap}>
      <View style={r.iconWrap}>
        <Ionicons name={icon} size={18} color={theme.colors.secondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={r.title}>{title}</Text>
        {!!subtitle && <Text style={r.subtitle}>{subtitle}</Text>}
      </View>
      <Switch value={!!value} onValueChange={onValueChange} testID={testID} />
    </View>
  );
}

/* ---------- Helpers UI: tarjeta/grupo ---------- */
function Group({ title, children }) {
  const { theme } = useTheme();
  const g = stylesGroup(theme);
  return (
    <View style={g.card}>
      {!!title && <Text style={g.title}>{title}</Text>}
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}

export default function AjustesScreen() {
  const router = useRouter();
  const { theme, setMode } = useTheme();
  const s = mkStyles(theme);

  const [cfg, setCfg] = useState(null);
  const [saving, setSaving] = useState(false);

  const goBackSafe = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/dashboard");
  }, [router]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSettings();
        setCfg({
          ui: { mode: data?.ui?.mode || "light" },
          notifications: {
            push: data?.notifications?.push ?? true,
            email: data?.notifications?.email ?? true,
          },
          privacy: {
            biometricLock: data?.privacy?.biometricLock ?? false,
            analytics: data?.privacy?.analytics ?? true,
          },
          data: {
            useMobileData: data?.data?.useMobileData ?? true,
            wifiOnlyUploads: data?.data?.wifiOnlyUploads ?? false,
          },
        });
      } catch (e) {
        Alert.alert("Error", e?.message || "No se pudo cargar ajustes.");
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setCfg(next);
    try {
      setSaving(true);
      await saveSettings(next);
    } catch (e) {
      Alert.alert("Error", e?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }, []);

  const setUiMode = useCallback(
    (mode) => {
      const next = { ...cfg, ui: { ...(cfg?.ui || {}), mode } };
      if (typeof setMode === "function") setMode(mode);
      persist(next);
    },
    [cfg, persist, setMode]
  );

  const toggle = useCallback(
    (path) => (val) => {
      const next = structuredClone(cfg);
      const segs = path.split(".");
      let ref = next;
      for (let i = 0; i < segs.length - 1; i++) ref[segs[i]] = ref[segs[i]] ?? {};
      ref[segs.at(-1)] = val;
      persist(next);
    },
    [cfg, persist]
  );

  if (!cfg) {
    return (
      <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
        <AppBar variant="section" title="Ajustes" showBorder={false} onBackPress={goBackSafe} />
        <View style={[s.center, { padding: 24 }]}>
          <Text style={{ color: theme.colors.textMuted }}>Cargando…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <AppBar variant="section" title="Ajustes" showBorder={false} onBackPress={goBackSafe} />

      {/* 👇 Scroll habilitado */}
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Apariencia */}
        <Group title="Apariencia">
          <SwitchRow
            icon="moon-outline"
            title="Modo oscuro"
            subtitle="Afecta colores de toda la app"
            value={(cfg.ui?.mode || "light") === "dark"}
            onValueChange={(v) => setUiMode(v ? "dark" : "light")}
            testID="switch-dark-mode"
          />
        </Group>

        {/* Notificaciones */}
        <Group title="Notificaciones">
          <SwitchRow
            icon="notifications-outline"
            title="Push"
            subtitle="Alertas en tu dispositivo"
            value={cfg.notifications?.push}
            onValueChange={toggle("notifications.push")}
          />
          <SwitchRow
            icon="mail-unread-outline"
            title="Email"
            subtitle="Resumenes y avisos por correo"
            value={cfg.notifications?.email}
            onValueChange={toggle("notifications.email")}
          />
          <Row
            icon="options-outline"
            title="Configurar canales"
            subtitle="Sonido, banners, prioridad…"
            onPress={() => router.push("/ajustes/notificaciones")}
          />
        </Group>

        {/* Privacidad y seguridad */}
        <Group title="Privacidad y seguridad">
          <SwitchRow
            icon="finger-print-outline"
            title="Bloqueo biométrico"
            subtitle="Requerir Face/Touch ID para abrir"
            value={cfg.privacy?.biometricLock}
            onValueChange={toggle("privacy.biometricLock")}
          />
          <SwitchRow
            icon="stats-chart-outline"
            title="Compartir analíticas"
            subtitle="Ayuda a mejorar la app (anónimo)"
            value={cfg.privacy?.analytics}
            onValueChange={toggle("privacy.analytics")}
          />
          <Row
            icon="key-outline"
            title="Gestión de sesiones"
            subtitle="Cerrar sesión en otros dispositivos"
            onPress={() => router.push("/ajustes/sesiones")}
          />
        </Group>

        {/* Datos y almacenamiento */}
        <Group title="Datos y almacenamiento">
          <SwitchRow
            icon="cellular-outline"
            title="Usar datos móviles"
            subtitle="Permitir red móvil para sincronizar"
            value={cfg.data?.useMobileData}
            onValueChange={toggle("data.useMobileData")}
          />
          <SwitchRow
            icon="cloud-upload-outline"
            title="Subidas solo por Wi-Fi"
            subtitle="Recomendado para archivos grandes"
            value={cfg.data?.wifiOnlyUploads}
            onValueChange={toggle("data.wifiOnlyUploads")}
          />
          <Row
            icon="trash-outline"
            title="Limpiar caché"
            subtitle="Liberar espacio local"
            onPress={() => Alert.alert("Listo", "Caché limpiada (mock).")}
          />
        </Group>

        {/* Sistema */}
        <Group title="Sistema">
          <Row
            icon="language-outline"
            title="Idioma"
            subtitle="Español"
            onPress={() => router.push("/ajustes/idioma")}
          />
          <Row
            icon="information-circle-outline"
            title="Acerca de"
            subtitle="Versión, licencias"
            onPress={() => router.push("/ajustes/acerca")}
          />
          <Row
            icon="help-circle-outline"
            title="Ayuda y soporte"
            subtitle="Preguntas frecuentes y contacto"
            onPress={() => router.push("/ajustes/soporte")}
          />
        </Group>

        {/* Botón final (dejamos paddingBottom grande para que no lo tape nada) */}
        <View style={{ marginTop: 4 }}>
          <Button
            title={saving ? "Guardando…" : "Guardar cambios"}
            onPress={async () => {
              try {
                setSaving(true);
                await saveSettings(cfg);
                Alert.alert("Guardado", "Se aplicaron tus ajustes.");
              } catch (e) {
                Alert.alert("Error", e?.message || "No se pudo guardar.");
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            loading={saving}
            variant="primary"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Estilos ---------- */
const mkStyles = (theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    // 👇 Usamos contentContainerStyle del ScrollView
    scroll: {
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl * 2, // margen extra para que no tape nada
    },
    center: { alignItems: "center", justifyContent: "center", flex: 1 },
  });

/* estilos auxiliares */
const stylesGroup = (theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      ...theme.shadow,
    },
    title: {
      color: theme.colors.text,
      fontSize: theme.font.h4,
      fontWeight: "800",
      marginBottom: 2,
    },
  });

const stylesRow = (theme) =>
  StyleSheet.create({
    wrap: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    title: { color: theme.colors.text, fontWeight: "700" },
    subtitle: { color: theme.colors.textMuted, marginTop: 2, fontSize: theme.font.small },
  });
