// app/(app)/ajustes/index.jsx
import React, {
  useEffect,
  useCallback,
  useState,
  useRef,
  useMemo,
} from "react";
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
  const styles = stylesRow(theme);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <View style={styles.wrap}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={18} color={theme.colors.secondary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </View>
    </Pressable>
  );
}

/* ---------- Helpers UI: fila con switch inmediato ---------- */
function SwitchRow({ icon, title, subtitle, value, onValueChange, testID }) {
  const { theme } = useTheme();
  const styles = stylesRow(theme);

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={theme.colors.secondary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={!!value}
        onValueChange={onValueChange}
        testID={testID}
        thumbColor={undefined}
        trackColor={{ true: theme.colors.secondary, false: theme.colors.border }}
      />
    </View>
  );
}

/* ---------- Helpers UI: tarjeta/grupo ---------- */
function Group({ title, children }) {
  const { theme } = useTheme();
  const styles = stylesGroup(theme);
  return (
    <View style={styles.card}>
      {!!title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.childrenWrap}>{children}</View>
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
  const fade = useRef(new Animated.Value(0)).current; // 0 = sin overlay, 1 = overlay visible
  const [overlayColor, setOverlayColor] = useState(theme.colors.background);
  const DURATION = 180; // ms

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

  // Crossfade al cambiar tema
  const setUiMode = useCallback(
    (mode) => {
      const next = { ...cfg, ui: { ...(cfg?.ui || {}), mode } };
      setOverlayColor(theme.colors.background);
      fade.setValue(1);
      requestAnimationFrame(() => {
        if (typeof setMode === "function") setMode(mode);
        Animated.timing(fade, {
          toValue: 0,
          duration: DURATION,
          useNativeDriver: true,
        }).start();
      });
      persist(next);
    },
    [cfg, persist, setMode, theme.colors.background, fade]
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
          notifications: { push: data?.notifications?.push ?? true },
          privacy: { biometricLock: data?.privacy?.biometricLock ?? false },
        });
      } catch (e) {
        Alert.alert("Error", e?.message || "No se pudo cargar ajustes.");
      }
    })();
  }, []);

  const toggle = useCallback(
    (path) => (val) => {
      setCfg((prev) => {
        const next = JSON.parse(JSON.stringify(prev || {}));
        const segs = path.split(".");
        let current = next;
        for (let i = 0; i < segs.length - 1; i++) {
          const key = segs[i];
          if (current[key] === undefined || typeof current[key] !== "object") {
            current[key] = {};
          }
          current = current[key];
        }
        current[segs[segs.length - 1]] = val;
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
        <View style={s.loadingWrap}>
          <Text style={s.loadingText}>Cargando…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // overlayStyle memoizado para evitar object literals en JSX
  const overlayStyle = useMemo(
    () => ({ backgroundColor: overlayColor, opacity: fade }),
    [overlayColor, fade]
  );

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <AppBar variant="section" title="Ajustes" showBorder={false} onBackPress={goBackSafe} />

      {/* Overlay para el crossfade (toma el color anterior y se desvanece) */}
      <Animated.View pointerEvents="none" style={[s.overlayBase, overlayStyle]} />

      <ScrollView
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

        <View style={s.spacer20} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Styles (sin inline styles / sin gap) ---------- */
const mkStyles = (theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { color: theme.colors.textMuted },

    overlayBase: {
      ...StyleSheet.absoluteFillObject,
      // backgroundColor & opacity se pasan desde overlayStyle (useMemo)
    },

    body: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },

    spacer20: { height: 20 },
  });

const stylesGroup = (theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      ...theme.shadow,
    },
    title: {
      color: theme.colors.text,
      fontSize: theme.font.h4,
      fontWeight: "800",
      marginBottom: 8,
    },
    childrenWrap: {
      // vertical stacking: usamos marginBottom en cada child en lugar de gap
    },
  });

const stylesRow = (theme) =>
  StyleSheet.create({
    wrap: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      // usamos paddings/margins en lugar de gap
      paddingVertical: 6,
    },
    pressable: {
      // base para Pressable (opacidad por pressed se aplica con styles.pressed)
    },
    pressed: {
      opacity: 0.6,
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
      marginRight: 12,
    },
    content: {
      flex: 1,
    },
    title: { color: theme.colors.text, fontWeight: "700" },
    subtitle: {
      color: theme.colors.textMuted,
      marginTop: 2,
      fontSize: theme.font.small,
    },
  });
