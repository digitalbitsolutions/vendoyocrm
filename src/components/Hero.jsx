import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../style/theme";

// logo blanco sobre fondo turquesa
const LOGO_WHITE = require("../../assets/images/brand/logo-light.webp");

/**
 * Hero fijo (brand Vendoyo)
 * - Fondo turquesa (no depende del tema)
 * - Logo blanco centrado
 * - Animación suave de aparición
 */
export function Hero({ size = "full" }) {
  const { theme } = useTheme();
  const s = mkStyles(theme);

  // animación suave (fade + scale)
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // tamaño del hero
  const containerStyle =
    size === "half"
      ? { height: "50%" }
      : size === "third"
      ? { height: "36%" }
      : { flex: 1 };

  // color turquesa fijo del brand
  const bgColor = "#36AAA7";

  // tamaño responsivo del logo
  const { width: screenW } = useWindowDimensions();
  const logoWidth = Math.min(320, Math.round(screenW * 0.6));
  const { width: lw, height: lh } = Image.resolveAssetSource(LOGO_WHITE);
  const logoHeight = Math.round(logoWidth * (lh / lw));

  return (
    <View style={[s.wrap, { backgroundColor: bgColor }, containerStyle]}>
      <StatusBar style="light" backgroundColor={bgColor} />

      <Animated.View
        style={[s.center, { opacity: fade, transform: [{ scale }] }]}
      >
        <Image
          source={LOGO_WHITE}
          style={{ width: logoWidth, height: logoHeight }}
          resizeMode="contain"
          accessibilityLabel="Vendoyo"
        />
      </Animated.View>
    </View>
  );
}

const mkStyles = (theme) =>
  StyleSheet.create({
    wrap: {
      ...(Platform.OS === "android" ? { elevation: 0 } : null),
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
  });
