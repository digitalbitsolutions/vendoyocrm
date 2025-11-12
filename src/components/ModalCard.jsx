import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../style/theme";

/**
 * ModalCard mejorado
 * Props:
 * - children: contenido
 * - onDismiss?: () => void → cierra tocando el fondo
 * - size?: "auto" | "half" | "full" → altura
 * - visible?: boolean → para controlar animación de entrada/salida
 */
export default function ModalCard({
  children,
  onDismiss,
  size = "auto",
  visible = true,
}) {
  const { theme } = useTheme();
  const s = mkStyles(theme);

  // animación entrada/salida
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 80,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const heightStyle =
    size === "full"
      ? { flex: 1 }
      : size === "half"
      ? { height: "55%" }
      : { alignSelf: "center" };

  return (
    <Animated.View
      style={[
        s.backdrop,
        { opacity },
      ]}
    >
      <Pressable
        onPress={onDismiss}
        style={StyleSheet.absoluteFill}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Cerrar modal"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, width: "100%", justifyContent: "flex-end" }}
      >
        <Animated.View
          style={[
            s.card,
            heightStyle,
            { transform: [{ translateY }] },
          ]}
        >
          <SafeAreaView edges={["bottom"]}>{children}</SafeAreaView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const mkStyles = (theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "flex-end",
    },
    card: {
      width: "94%",
      maxWidth: 720,
      alignSelf: "center",
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor:
        theme.mode === "dark"
          ? theme.colors.border
          : theme.colors.primary + "22", // toque sutil del brand en light
      ...theme.shadow,
      overflow: "hidden",
      paddingBottom: Platform.OS === "ios" ? theme.spacing.md : 0,
    },
  });
