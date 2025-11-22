// app/(app)/dashboard/_layout.jsx
import React, { useMemo, useCallback } from "react";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";
import { Drawer } from "expo-router/drawer";
import { useRouter, usePathname } from "expo-router";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/style/theme";
import { useAuth } from "../../../src/context/AuthContext";

/* Helper: si la ruta está activa */
function isActive(pathname, href) {
  if (!pathname || !href) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

/* Item memoizado para evitar re-renders innecesarios */
const DrawerItem = React.memo(function DrawerItem({
  icon,
  label,
  onPress,
  active,
}) {
  const { theme } = useTheme();
  const s = useMemo(() => mkStyles(theme), [theme]);

  return (
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
      accessibilityState={{ selected: !!active }}
    >
      <View style={s.itemLeft}>
        {active ? <View style={s.activeDot} /> : <View style={{ width: 6 }} />}
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
});

/* Contenido personalizado del Drawer */
function CustomDrawerContent(props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const pathname = usePathname();
  const { theme } = useTheme();
  const s = useMemo(() => mkStyles(theme), [theme]);

  const MENU = useMemo(
    () => [
      { icon: "stats-chart", label: "Dashboard", href: "/(app)/dashboard" },
      { icon: "briefcase", label: "Mis Trámites", href: "/(app)/tramites" },
      { icon: "people", label: "Clientes", href: "/(app)/clientes" },
      { icon: "bar-chart", label: "Reportes", href: "/(app)/reportes" },
      { icon: "time", label: "Historial", href: "/(app)/historial" },
      { icon: "settings", label: "Configuración", href: "/(app)/ajustes" },
      { icon: "chatbubbles", label: "Asistente AI", href: "/(app)/ai" },
    ],
    []
  );

  const go = useCallback(
    (href) => {
      props.navigation?.closeDrawer?.();
      router.push(href);
    },
    [props.navigation, router]
  );

  const onSignOut = useCallback(async () => {
    props.navigation?.closeDrawer?.();
    await signOut();
    router.replace("/(auth)/login");
  }, [props.navigation, signOut, router]);

  return (
    <SafeAreaView style={[s.drawerRoot]} edges={["top", "bottom"]}>
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
          <DrawerItem
            key={it.href}
            icon={it.icon}
            label={it.label}
            onPress={() => go(it.href)}
            active={isActive(pathname, it.href)}
          />
        ))}

        <View style={{ height: theme.spacing.md }} />

        {/* Cerrar sesión: ancho completo interior con borde red */}
        <View style={s.logoutWrap}>
          <Pressable
            onPress={onSignOut}
            style={({ pressed }) => [
              s.logoutBtn,
              pressed && { opacity: theme.opacity.pressed },
            ]}
            hitSlop={theme.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <Ionicons name="log-out" size={20} color={theme.colors.danger} />
            <Text style={s.logoutText}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* Layout con Drawer (opciones dependientes del tema) */
export default function DashboardLayout() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  // Drawer width responsivo: no más de 360, y porcentaje si pantalla pequeña
  const drawerWidth = Math.min(360, Math.round(width * 0.78));

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerPosition: "right",
        drawerType: "front",
        overlayColor: theme.colors.overlay,
        drawerStyle: {
          width: drawerWidth,
          backgroundColor: theme.colors.surface,
          borderLeftWidth: 1,
          borderLeftColor:
            theme.mode === "dark"
              ? theme.colors.border
              : theme.colors.primary + "22",
        },
        swipeEdgeWidth: 40,
        sceneContainerStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
      drawerContent={(p) => <CustomDrawerContent {...p} />}
    >
      <Drawer.Screen name="index" options={{ headerShown: false }} />
    </Drawer>
  );
}

/* ---------- Estilos dependientes del tema (sin `gap`) ---------- */
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
      backgroundColor: theme.colors.surface,
    },

    /* item: usando marginBottom en lugar de gap para RN */
    item: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing.md,
    },
    itemActive: {
      backgroundColor: "rgba(0,0,0,0.04)",
    },
    itemLeft: {
      flexDirection: "row",
      alignItems: "center",
      width: 48,
      marginRight: 8,
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
      fontSize: theme.font.h3,
      fontWeight: "700",
    },
    itemTextActive: {
      color: theme.colors.secondary,
    },

    /* Logout */
    logoutWrap: {
      paddingHorizontal: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      paddingVertical: 14,
      borderRadius: theme.radius.xl,
      borderWidth: 1.5,
      borderColor: theme.colors.danger,
      backgroundColor: "transparent",
    },
    logoutText: {
      color: theme.colors.danger,
      fontSize: theme.font.small,
      fontWeight: "700",
      marginLeft: 8,
    },
  });
