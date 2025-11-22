import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../style/theme";

// Variantes de logo (texto blanco y texto turquesa)
const LOGO_LIGHT = require("../../../assets/images/brand/logo-dark.webp"); // turquesa sobre fondo claro
const LOGO_DARK = require("../../../assets/images/brand/logo-light.webp"); // blanco sobre fondo oscuro

export default function AppBar({
  // variantes
  variant = "dashboard", // "dashboard" | "section"
  title = "",

  // navegación
  onBack,
  onBackPress,

  // UI
  style,
  showBorder = true,
  right = null,

  // marca
  forceLogoVariant, // "light" | "dark" | undefined

  // escalabilidad
  logoWidth = 140, // ancho del logo (alto se calcula por ratio)
  logoAspect = 5, // ratio W/H del logo (evita deformaciones)
  transparent = false, // header transparente (p.ej. sobre imágenes)
}) {
  const router = useRouter();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const s = mkStyles(theme, { transparent, showBorder });

  const openDrawer = () => {
    if (navigation?.openDrawer) navigation.openDrawer();
  };

  const handleBack = () => {
    if (typeof onBackPress === "function") return onBackPress();
    if (typeof onBack === "function") return onBack();
    router.replace("/(app)/dashboard");
  };

  // elegir logo según tema/override
  const logoSrc =
    forceLogoVariant === "dark"
      ? LOGO_DARK
      : forceLogoVariant === "light"
      ? LOGO_LIGHT
      : theme.mode === "dark"
      ? LOGO_DARK
      : LOGO_LIGHT;

  // header tipo sección (flecha + título)
  if (variant === "section") {
    return (
      <>
        <StatusBar
          style={theme.statusBarStyle}
          backgroundColor={theme.statusBarBg}
        />
        <View style={[s.wrap, style]}>
          <Pressable
            onPress={handleBack}
            hitSlop={theme.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            android_ripple={{ color: theme.colors.primary400 }}
            style={s.left}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
            <Text numberOfLines={1} style={s.titleSection}>
              {title}
            </Text>
          </Pressable>

          {right ? (
            <View style={s.rightBtn}>{right}</View>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>
      </>
    );
  }

  // header tipo dashboard (logo + hamburguesa o slot derecho)
  return (
    <>
      <StatusBar
        style={theme.statusBarStyle}
        backgroundColor={theme.statusBarBg}
      />
      <View style={[s.wrap, style]}>
        <View style={s.left}>
          <Image
            source={logoSrc}
            style={{
              width: logoWidth,
              height: undefined,
              aspectRatio: logoAspect,
            }}
            resizeMode="contain"
            accessibilityLabel="VendoYo"
          />
        </View>

        {right ? (
          <View style={s.rightBtn}>{right}</View>
        ) : (
          <Pressable
            onPress={openDrawer}
            hitSlop={theme.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Abrir menú"
            android_ripple={{
              color: theme.colors.primary400,
              borderless: true,
            }}
            style={s.rightBtn}
          >
            <Ionicons name="menu" size={24} color={theme.colors.text} />
          </Pressable>
        )}
      </View>
    </>
  );
}

const mkStyles = (theme, { transparent, showBorder }) =>
  StyleSheet.create({
    wrap: {
      height: 56,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: transparent ? "transparent" : theme.colors.surface,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      ...(!transparent ? theme.shadow : { shadowOpacity: 0 }),
      ...(Platform.OS === "android"
        ? { elevation: transparent ? 0 : 4, overflow: "hidden" }
        : null),
      borderBottomWidth: showBorder ? (theme.mode === "dark" ? 0.5 : 1) : 0,
      borderBottomColor: transparent ? "transparent" : theme.colors.border,
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flexShrink: 1,
    },
    rightBtn: {
      height: 40,
      minWidth: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
    },
    titleSection: {
      fontSize: theme.font.h3,
      fontWeight: "700",
      color: theme.colors.text,
      maxWidth: 240,
    },
  });
