import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  DeviceEventEmitter,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../../../src/style/theme";

export const options = {
  presentation: "transparentModal",
  headerShown: false,
  animation: "slide_from_bottom",
  contentStyle: { backgroundColor: "transparent" },
};

export default function EditarTramiteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const id = params?.id ? String(params.id) : null;

  const { theme } = useTheme();
  const s = mkStyles(theme);

  // Form
  const [titulo, setTitulo] = useState("");
  const [ref, setRef] = useState("");
  const [cliente, setCliente] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estado, setEstado] = useState("Pendiente");
  const [descripcion, setDescripcion] = useState("");

  const toISO = (d) => {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((d || "").trim());
    if (!m) return null;
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  };
  const toHuman = (iso) => {
    if (!iso || typeof iso !== "string") return "";
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!m) return "";
    return `${m[3]}/${m[2]}/${m[1]}`;
  };

  const canSave = useMemo(() => {
    return !!(titulo.trim() && ref.trim() && cliente.trim());
  }, [titulo, ref, cliente]);

  const onClose = () => router.back();

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("tramite:prefill", (item) => {
      if (!item) return;
      if (id && item.id && item.id !== id) return;
      setTitulo(item.titulo || "");
      setRef((item.ref || "").toUpperCase());
      setCliente(item.cliente || "");
      setFechaFin(toHuman(item.fechaFinEstimada || item.fechaFin || ""));
      const estadoMap = {
        pendiente: "Pendiente",
        proceso: "En Proceso",
        completado: "Completado",
        Pendiente: "Pendiente",
        "En Proceso": "En Proceso",
        Completado: "Completado",
      };
      setEstado(estadoMap[item.estado] || "Pendiente");
      setDescripcion(item.descripcion || "");
    });

    if (params?.titulo) setTitulo(String(params.titulo));
    if (params?.ref) setRef(String(params.ref).toUpperCase());
    if (params?.cliente) setCliente(String(params.cliente));
    if (params?.fechaFinEstimada)
      setFechaFin(toHuman(String(params.fechaFinEstimada)));
    if (params?.estado) {
      const e = String(params.estado);
      const map = {
        pendiente: "Pendiente",
        proceso: "En Proceso",
        completado: "Completado",
      };
      setEstado(map[e] || e);
    }
    if (params?.descripcion) setDescripcion(String(params.descripcion));

    return () => sub.remove();
  }, [id, params]);

  const copyId = async () => {
    if (!id) return;
    try {
      await Clipboard.setStringAsync(String(id));
      Alert.alert("Copiado", "ID copiado al portapapeles");
    } catch {
      // silent
    }
  };

  const onRefBlur = () => setRef((r) => (r || "").toUpperCase().trim());

  const onSubmit = () => {
    if (!canSave) {
      Alert.alert(
        "Faltan datos",
        "Completa título, referencia y cliente para guardar."
      );
      return;
    }

    const payload = {
      id: id || `tmp-${Date.now()}`,
      titulo: titulo.trim(),
      ref: (ref || "").toUpperCase().trim(),
      cliente: cliente.trim(),
      fechaInicio: null,
      fechaFinEstimada: toISO(fechaFin) || null,
      estado,
      descripcion: (descripcion || "").trim(),
    };

    DeviceEventEmitter.emit("tramite:updated", payload);
    router.back();
  };

  return (
    <SafeAreaView style={s.backdrop} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={s.card}>
          <View style={s.header}>
            <View style={s.headerTop}>
              <Text style={s.title}>Editar Trámite</Text>
              <Pressable
                onPress={onClose}
                style={s.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
              >
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </Pressable>
            </View>

            {!!id && (
              <Pressable
                onPress={copyId}
                style={s.idRow}
                accessibilityRole="button"
                accessibilityLabel="Copiar ID"
              >
                <Ionicons
                  name="copy-outline"
                  size={14}
                  color={theme.colors.textMuted}
                />
                <Text style={s.idText} numberOfLines={1}>
                  {id}
                </Text>
              </Pressable>
            )}
          </View>

          <ScrollView
            contentContainerStyle={[
              s.content,
              // dejamos suficiente espacio inferior para que el botón no tape contenido
              { paddingBottom: insets.bottom + 140 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={s.label}>Título: *</Text>
            <TextInput
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ej: Compraventa Inmuebles"
              placeholderTextColor={theme.colors.textMuted}
              style={s.input}
              returnKeyType="next"
            />

            <Text style={s.label}>Referencia: *</Text>
            <TextInput
              value={ref}
              onChangeText={setRef}
              onBlur={onRefBlur}
              placeholder="Ej: CV-2025-0037"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="characters"
              style={s.input}
              returnKeyType="next"
            />

            <Text style={s.label}>Cliente: *</Text>
            <TextInput
              value={cliente}
              onChangeText={setCliente}
              placeholder="Ej: Miguel Yesan"
              placeholderTextColor={theme.colors.textMuted}
              style={s.input}
              returnKeyType="next"
            />

            <Text style={s.label}>Fecha Fin Estimada</Text>
            <TextInput
              value={fechaFin}
              onChangeText={setFechaFin}
              placeholder="dd/mm/aaaa"
              placeholderTextColor={theme.colors.textMuted}
              style={s.input}
              keyboardType={
                Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"
              }
              returnKeyType="next"
            />

            <Text style={s.label}>Estado</Text>
            <View style={s.chipsRow}>
              <Pressable
                onPress={() => setEstado("Pendiente")}
                style={[s.chip, estado === "Pendiente" && s.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: estado === "Pendiente" }}
              >
                <Text
                  style={[
                    s.chipText,
                    estado === "Pendiente" && s.chipTextActive,
                  ]}
                >
                  Pendiente
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setEstado("En Proceso")}
                style={[s.chip, estado === "En Proceso" && s.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: estado === "En Proceso" }}
              >
                <Text
                  style={[
                    s.chipText,
                    estado === "En Proceso" && s.chipTextActive,
                  ]}
                >
                  En Proceso
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setEstado("Completado")}
                style={[s.chip, estado === "Completado" && s.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: estado === "Completado" }}
              >
                <Text
                  style={[
                    s.chipText,
                    estado === "Completado" && s.chipTextActive,
                  ]}
                >
                  Completado
                </Text>
              </Pressable>
            </View>

            <Text style={[s.label, { marginTop: 12 }]}>Descripción</Text>
            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe el trámite..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
              style={[s.input, { height: 120, textAlignVertical: "top" }]}
            />
          </ScrollView>

          {/* AJUSTE MINIMO: mantengo estilos, solo dejo más espacio inferior para el botón */}
          <View
            style={[
              s.saveBar,
              s.saveBarShadow,
              { paddingBottom: insets.bottom + 16 },
            ]}
          >
            <Pressable
              onPress={onSubmit}
              disabled={!canSave}
              style={({ pressed }) => [
                s.saveCta,
                pressed && { opacity: theme.opacity.pressed },
                !canSave && { opacity: theme.opacity.disabled },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Guardar cambios"
              accessibilityState={{ disabled: !canSave }}
            >
              <Ionicons
                name="save-outline"
                size={18}
                color={theme.colors.onSecondary}
              />
              <Text style={s.saveCtaText}>Guardar cambios</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- estilos reactivos (cambios mínimos respecto a tu versión) ---------- */
const mkStyles = (theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      backgroundColor: theme.colors.overlay ?? "rgba(0,0,0,0.35)",
    },

    card: {
      width: "92%",
      maxWidth: 720,
      alignSelf: "center",
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      ...theme.shadow,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    header: {
      paddingTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    title: {
      fontSize: theme.font.h2,
      fontWeight: "800",
      color: theme.colors.text,
      lineHeight: theme.font.h2 + 4,
    },
    closeBtn: {
      height: 36,
      width: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },

    idRow: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.03)" : "#F1F5F9",
      marginTop: 2,
    },
    idText: {
      maxWidth: 220,
      fontSize: 11,
      fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
      color: theme.colors.textMuted,
    },

    content: { padding: theme.spacing.lg, gap: theme.spacing.sm },

    label: {
      marginTop: theme.spacing.sm,
      marginBottom: 6,
      fontSize: theme.font.small,
      fontWeight: "800",
      color: theme.colors.text,
    },

    input: {
      height: 44,
      paddingHorizontal: 12,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      fontSize: theme.font.body,
    },

    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: theme.radius.pill,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    },
    chipActive: { backgroundColor: theme.colors.secondary },
    chipText: {
      fontWeight: "700",
      color: theme.colors.text,
      fontSize: theme.font.small,
    },
    chipTextActive: { color: theme.colors.onSecondary },

    saveBarShadow: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: -2 },
      elevation: 3,
    },
    saveBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.surface,
      paddingTop: 10,
      paddingHorizontal: theme.spacing.lg,
    },

    // AJUSTE MIN: dejamos margenBottom mayor para que el botón no se vea cortado
    saveCta: {
      height: 56,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      marginHorizontal: 16,
      // nota: marginBottom lo dejamos suficientemente alto para que no corte en pantallas con notch
      marginBottom: 18,
    },
    saveCtaText: {
      color: theme.colors.onSecondary,
      fontWeight: "900",
      fontSize: theme.font.h3,
    },
  });
