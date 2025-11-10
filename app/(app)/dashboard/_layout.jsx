// app/(app)/dashboard/_layout.jsx
// -------------------------------------------------------------------------------------
// Drawer SOLO para /dashboard con tema dinámico (light/dark):
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
import { useTheme } from "../../../src/style/theme";
import { useAuth } from "../../../src/context/AuthContext";

// Helper: ¿la ruta está activa?
function isActive(pathname, href) {
  if (!pathname || !href) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

// Contenido personalizado del Drawer (lee el tema dinámico)
function CustomDrawerContent(props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const pathname = usePathname();
  const { theme } = useTheme();
  const s = mkStyles(theme);

  // Componente interno: punto activo
  const ActiveDot = () => <View style={s.activeDot} />;

  // Componente interno: item del menú
  const Item = ({ icon, label, onPress, active = false }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.item,
        active && s.itemActive,
        pressed && !active && { backgroundColor: "rgba(0,0,0,0.03)" },
        pressed && { opacity: theme.opacity.pressed },
      ]}
      hitSlop={theme.hitSlop}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={s.itemLeft}>
        {active ? <ActiveDot /> : <View style={{ width: 6 }} />}
        <Ionicons
          name={icon}
          size={22}
          color={active ? theme.colors.secondary : theme.colors.textMuted}
          style={{ width: 26, marginLeft: 6 }}
        />
      </View>
      <Text style={[s.itemText, active && s.itemTextActive]}>{label}</Text>
    </Pressable>
  );

  const go = (href) => {
    props.navigation?.closeDrawer?.();
    router.push(href);
  };

  const MENU = [
    { icon: "stats-chart", label: "Dashboard", href: "/(app)/dashboard" },
    { icon: "briefcase", label: "Mis Trámites", href: "/(app)/tramites" },
    { icon: "people", label: "Clientes", href: "/(app)/clientes" },
    { icon: "bar-chart", label: "Reportes", href: "/(app)/reportes" },
    { icon: "time", label: "Historial", href: "/(app)/historial" },
    { icon: "settings", label: "Configuración", href: "/(app)/ajustes" },
    { icon: "chatbubbles", label: "Asistente AI", href: "/(app)/ai" },
  ];

  return (
    <View style={[s.drawerRoot, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Menú</Text>
        <Pressable
          onPress={() => props.navigation?.closeDrawer?.()}
          hitSlop={theme.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú lateral"
          style={s.closeBtn}
        >
          <Ionicons name="close" size={22} color={theme.colors.text} />
        </Pressable>
      </View>

      {/* Lista */}
      <ScrollView
        contentContainerStyle={[
          s.menu,
          { paddingBottom: insets.bottom + theme.spacing.lg },
        ]}
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

        <View style={{ height: theme.spacing.md }} />

        {/* Cerrar sesión */}
        <Pressable
          onPress={async () => {
            props.navigation?.closeDrawer?.();
            await signOut();
            router.replace("/(auth)/login");
          }}
          style={({ pressed }) => [s.logoutBtn, pressed && { opacity: theme.opacity.pressed }]}
          hitSlop={theme.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
        >
          <Ionicons name="log-out" size={18} color={theme.colors.danger} />
          <Text style={s.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// Layout con Drawer (opciones dependientes del tema)
export default function DashboardLayout() {
  const { theme } = useTheme();

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerPosition: "right",
        drawerType: "front",
        overlayColor: theme.colors.overlay, // ✅ dinámico
        drawerStyle: {
          width: 280,
          backgroundColor: theme.colors.surface, // ✅
          borderLeftWidth: 1,
          borderLeftColor: theme.colors.border,  // ✅
        },
        swipeEdgeWidth: 40,
        sceneContainerStyle: {
          backgroundColor: theme.colors.background, // ✅
        },
      }}
      drawerContent={(p) => <CustomDrawerContent {...p} />}
    >
      <Drawer.Screen name="index" options={{ headerShown: false }} />
    </Drawer>
  );
}

/* ---------- Estilos dependientes del tema ---------- */
const mkStyles = (theme) =>
  StyleSheet.create({
    drawerRoot: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },

    header: {
      height: 56,
      paddingHorizontal: theme.spacing.lg,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
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

    menu: {
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },

    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: theme.radius.lg,
    },
    itemActive: {
      backgroundColor: "rgba(0,0,0,0.04)",
    },
    itemLeft: {
      flexDirection: "row",
      alignItems: "center",
      width: 36,
    },
    activeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.secondary,
      marginRight: 4,
    },
    itemText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    itemTextActive: {
      color: theme.colors.secondary,
    },

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
