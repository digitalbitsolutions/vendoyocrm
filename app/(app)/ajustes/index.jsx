// app/(app)/ajustes/index.jsx
// Pantalla de Ajustes (muy simple) con "Cerrar sesión"

import { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useAuth } from "../../../src/context/AuthContext"; // <- tu hook
import { theme } from "../../../src/style/theme";

export default function AjustesScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth(); // <- tenemos datos y acción

  // Derivamos un nombre corto bonito (solo para el header de esta pantalla)
  const firstName = useMemo(() => (user?.name || "Usuario").split(" ")[0], [user]);

  // Confirmación de cierre de sesión
  const onSignOut = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Seguro que quieres salir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            await signOut();    // 1) borra storage + estado en AuthContext
            router.replace("/"); // 2) tu Gate en app/index redirige a /(auth)/login
          },
        },
      ],
    );
  };

  // UI
  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Encabezado muy simple */}
      <View style={s.header}>
        <Text style={s.title}>Ajustes</Text>
        <Text style={s.subtitle}>Hola, {firstName}.</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Bloque de opciones (placeholders) */}
        <View style={s.card}>
          <Option
            label="Perfil"
            hint="Ver y editar tus datos"
            onPress={() => router.push("/perfil")}
          />
          <Divider />
          <Option
            label="Trámites"
            hint="Listado de tus trámites"
            onPress={() => router.push("/tramites")}
          />
          <Divider />
          <Option
            label="Soporte"
            hint="¿Necesitas ayuda?"
            onPress={() => router.push("/soporte")}
          />
        </View>

        {/* Botón rojo: Cerrar sesión */}
        <TouchableOpacity style={s.signOutBtn} onPress={onSignOut}>
          <Text style={s.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* --- Item de opción reutilizable --- */
function Option({ label, hint, onPress }) {
  return (
    <TouchableOpacity style={s.option} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flex: 1 }}>
        <Text style={s.optionLabel}>{label}</Text>
        {hint ? <Text style={s.optionHint}>{hint}</Text> : null}
      </View>
      <Text style={s.chevron}>›</Text>
    </TouchableOpacity>
  );
}
function Divider() {
  return <View style={s.divider} />;
}

/* --- Estilos --- */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.font.h2,
    fontWeight: "800",
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
  },
  scroll: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    ...theme.shadow,
  },
  option: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  optionLabel: {
    color: theme.colors.text,
    fontSize: theme.font.base,
    fontWeight: "700",
  },
  optionHint: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginHorizontal: theme.spacing.lg,
  },
  chevron: {
    fontSize: 24,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.md,
  },
  signOutBtn: {
    backgroundColor: theme.colors.error ?? "#B91C1C",
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
  signOutText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: theme.font.base,
  },
});
