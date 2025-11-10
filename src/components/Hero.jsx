import React from "react";
import { ImageBackground, Image, View, StyleSheet, useWindowDimensions } from "react-native";
import { useTheme } from "../style/theme";

const BG   = require("../../assets/images/Hero/background.png");
const LOGO = require("../../assets/images/Hero/logo.png");

export function Hero() {
  const { theme } = useTheme();          // ✅ tema actual (light/dark)
  const s = mkStyles(theme);             // ✅ styles reactivos al tema

  const { width: screenW } = useWindowDimensions();
  const logoWidth = Math.min(320, Math.round(screenW * 0.6));

  // mantener proporción del logo
  const { width: lw, height: lh } = Image.resolveAssetSource(LOGO);
  const logoHeight = Math.round(logoWidth * (lh / lw));

  return (
    <View style={s.wrap}>
      <ImageBackground
        source={BG}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        imageStyle={{ transform: [{ scale: 1.06 }] }}
      />
      {/* ✅ overlay sutil para mejorar contraste en dark */}
      <View style={s.overlay} pointerEvents="none" />

      <View style={s.center}>
        <Image
          source={LOGO}
          style={{ width: logoWidth, height: logoHeight }}
          resizeMode="contain"
          accessible
          accessibilityLabel="VendoYo.es"
        />
      </View>
    </View>
  );
}

const mkStyles = (theme) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    center: {
      position: "absolute",
      left: 0, right: 0, top: 0, bottom: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      // En claro no afecta; en oscuro añade un velo para que el logo/white no deslumbre
      backgroundColor: theme.mode === "dark" ? "rgba(0,0,0,0.25)" : "transparent",
    },
  });
