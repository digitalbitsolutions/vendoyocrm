import React from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../style/theme";

export default function ModalCard({ children }) {
  const { theme } = useTheme();              // ← tema actual (light/dark)
  const s = mkStyles(theme);                 // ← styles reactivos al tema

  return (
    <SafeAreaView style={[s.backdrop]} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, width: "100%" }}
      >
        {/* Card centrada y con ancho controlado por nosotros */}
        <View style={s.card}>{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}      
const mkStyles = (theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      // antes: style inline con theme.colors.overlay
      backgroundColor: theme.colors.overlay,
    },
    card: {
      // ⬇️ controla el ancho visual
      width: "94%",
      maxWidth: 720, // para tablet
      alignSelf: "center",

      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      ...theme.shadow,
      overflow: "hidden",

      // opcional: borde sutil que ayuda en dark
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  });
