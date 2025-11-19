import React, { useEffect, useCallback, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  Animated,
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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? theme.opacity?.pressed ?? 0.6 : 1 }]}
      accessibilityRole="button"
    >
      <View style={stylesRow(theme).wrap}>
        <View style={stylesRow(theme).iconWrap}>
          <Ionicons name={icon} size={18} color={theme.colors.secondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={stylesRow(theme).title}>{title}</Text>
          {!!subtitle && <Text style={stylesRow(theme).subtitle}>{subtitle}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </View>
    </Pressable>
  );
}

/* ---------- Helpers UI: fila con switch inmediato ---------- */
function SwitchRow({ icon, title, subtitle, value, onValueChange, testID }) {
  const { theme } = useTheme();
  return (
    <View style={stylesRow(theme).wrap}>
      <View style={stylesRow(theme).iconWrap}>
        <Ionicons name={icon} size={18} color={theme.colors.secondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={stylesRow(theme).title}>{title}</Text>
        {!!subtitle && <Text style={stylesRow(theme).subtitle}>{subtitle}</Text>}
      </View>
      <Switch value={!!value} onValueChange={onValueChange} testID={testID} />
    </View>
  );
}

/* ---------- Helpers UI: tarjeta/grupo ---------- */
function Group({ title, children }) {
  const { theme } = useTheme();
  return (
    <View style={stylesGroup(theme).card}>
      {!!title && <Text style={stylesGroup(theme).title}>{title}</Text>}
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}

export default function Ajustes() {
  const router = useRouter();
  const { theme, setMode } = useTheme();
  const s = mkStyles(theme);

  const [cfg, setCfg] = useState(null);
  const [saving, setSaving] = useState(false);

  // ⚡ Crossfade local de tema
  const fade = useRef(new Animated.Value(0)).current;      // 0 = sin overlay, 1 = overlay visible
  const [overlayColor, setOverlayColor] = useState(theme.colors.background);
  const DURATION = 180;                                     // ajusta la suavidad aquí (ms)

  const persist = useCallback(
    async (next) => {
      setCfg(next);
      try {
        setSaving(true);
        await saveSettings(next);
      } catch (e) {
        Alert.alert("Error", e?.message || "No se pudo guardar.");
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // Crossfade al cambiar tema
  const setUiMode = useCallback(
    (mode) => {
      const next = { ...cfg, ui: { ...(cfg?.ui || {}), mode } };
      // color de fondo ACTUAL (antes de cambiar)
      setOverlayColor(theme.colors.background);
      // mostramos overlay con el color anterior
      fade.setValue(1);
      // en el siguiente frame cambiamos tema y desvanecemos overlay
      requestAnimationFrame(() => {
        if (typeof setMode === "function") setMode(mode);
        Animated.timing(fade, { toValue: 0, duration: DURATION, useNativeDriver: true }).start();
      });
      persist(next);
    },
    [cfg, persist, setMode, theme.colors.background, fade, DURATION]
  );

  const goBackSafe = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(app)/dashboard");
  }, [router]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSettings();
        setCfg({
          ui: { mode: data?.ui?.mode || "light" },
          notifications: {
            push: data?.notifications?.push ?? true
          },
          privacy: {
            biometricLock: data?.privacy?.biometricLock ?? false
          }
        });
      } catch (e) {
        Alert.alert("Error", e?.message || "No se pudo cargar ajustes.");
      }
    })();
  }, []);

  const toggle = useCallback(
    (path) => (val) => {
      setCfg(prev => {
        // Crear una copia profunda del estado actual
        const next = JSON.parse(JSON.stringify(prev));
        
        // Dividir la ruta en segmentos
        const segs = path.split('.');
        
        // Navegar hasta el objeto padre del valor a modificar
        let current = next;
        for (let i = 0; i < segs.length - 1; i++) {
          const key = segs[i];
          if (current[key] === undefined) {
            current[key] = {};
          } else if (typeof current[key] !== 'object') {
            // Si el valor actual no es un objeto, lo convertimos en uno
            current[key] = {};
          }
          current = current[key];
        }
        
        // Establecer el nuevo valor
        current[segs[segs.length - 1]] = val;
        
        // Guardar los cambios
        persist(next);
        
        return next;
      });
    },
    [persist]
  );

  if (!cfg) {
    return (
      <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
        <AppBar variant="section" title="Ajustes" showBorder={false} onBackPress={goBackSafe} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.textMuted }}>Cargando…</Text>
        </View>
      </SafeAreaView>
    );
  }

    return (
      <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
        <AppBar variant="section" title="Ajustes" showBorder={false} onBackPress={goBackSafe} />

        {/* Overlay para el crossfade (toma el color anterior y se desvanece) */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: overlayColor, opacity: fade },
          ]}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.body}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
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

          <Group title="Notificaciones">
            <SwitchRow
              icon="notifications-outline"
              title="Notificaciones push"
              subtitle="Alertas en tu dispositivo"
              value={cfg.notifications?.push}
              onValueChange={toggle("notifications.push")}
            />
          </Group>

          <Group title="Seguridad">
            <Row
              icon="key-outline"
              title="Gestión de sesiones"
              subtitle="Cerrar sesión en otros dispositivos"
              onPress={() => router.push("/(app)/ajustes/sesiones")}
            />
          </Group>

<Group title="Sistema">
            <Row icon="language-outline" title="Idioma" subtitle="Español" onPress={() => router.push("/(app)/ajustes/idioma")} />
            <Row icon="information-circle-outline" title="Acerca de" subtitle="Versión, licencias" onPress={() => router.push("/(app)/ajustes/acerca")} />
            <Row icon="help-circle-outline" title="Ayuda y soporte" subtitle="Preguntas frecuentes y contacto" onPress={() => router.push("/(app)/ajustes/soporte")} />
          </Group>
          
          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }
const mkStyles = (theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    body: { padding: theme.spacing.lg, gap: theme.spacing.lg }
  });

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
    title: { color: theme.colors.text, fontSize: theme.font.h4, fontWeight: "800", marginBottom: 2 },
  });

const stylesRow = (theme) =>
  StyleSheet.create({
    wrap: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 12 },
    iconWrap: {
      width: 28, height: 28, borderRadius: 14,
      alignItems: "center", justifyContent: "center",
      backgroundColor: theme.colors.background,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    title: { color: theme.colors.text, fontWeight: "700" },
    subtitle: { color: theme.colors.textMuted, marginTop: 2, fontSize: theme.font.small },
  });
