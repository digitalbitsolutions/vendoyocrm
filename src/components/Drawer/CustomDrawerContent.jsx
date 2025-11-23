// src/components/Drawer/CustomDrawerContent.jsx
import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "../../style/theme";
import { useAuth } from "../../context/AuthContext";

/* Helper */
function isActive(pathname, href) {
  if (!pathname || !href) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

/* Drawer item memoizado */
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
        pressed && !active && s.pressedOverlay,
        pressed && s.pressed,
      ]}
      hitSlop={theme.hitSlop}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
    >
      <View style={s.itemLeft}>
        {active ? (
          <View style={s.activeDot} />
        ) : (
          <View style={s.placeholderDot} />
        )}
        <Ionicons
          name={icon}
          size={22}
          color={active ? theme.colors.secondary : theme.colors.textMuted}
          style={s.icon}
        />
      </View>
      <Text style={[s.itemText, active && s.itemTextActive]}>{label}</Text>
    </Pressable>
  );
});

/* Componente exportado */
export default function CustomDrawerContent(props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const { signOut } = useAuth();
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

  const paddingBottom = insets.bottom + theme.spacing.lg;

  return (
    <SafeAreaView style={[s.drawerRoot]} edges={["top", "bottom"]}>
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

      <ScrollView
        contentContainerStyle={[s.menu, { paddingBottom }]}
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

        <View style={s.spacer} />

        <Pressable
          onPress={onSignOut}
          style={({ pressed }) => [s.logoutBtn, pressed && s.pressed]}
          hitSlop={theme.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
        >
          <Ionicons name="log-out" size={18} color={theme.colors.danger} />
          <Text style={s.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* Estilos */
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
    item: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing.sm,
    },
    itemActive: {
      backgroundColor: "rgba(0,0,0,0.04)",
    },
    itemLeft: {
      flexDirection: "row",
      alignItems: "center",
      width: 36,
      marginRight: 12,
    },
    activeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.secondary,
      marginRight: 4,
    },
    placeholderDot: {
      width: 6,
      height: 6,
      marginRight: 4,
    },
    icon: {
      width: 26,
      marginLeft: 6,
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
    pressedOverlay: {
      backgroundColor: "rgba(0,0,0,0.03)",
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
    spacer: {
      height: theme.spacing.md,
    },
  });
