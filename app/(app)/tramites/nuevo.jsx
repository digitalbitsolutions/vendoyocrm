// app/(app)/tramites/nuevo.jsx
import React, { useMemo, useState } from "react";
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
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";

import { useTheme } from "../../../src/style/theme";
import { Button } from "../../../src/components/Button";

export const options = {
  presentation: "transparentModal",
  headerShown: false,
  animation: "slide_from_bottom",
  contentStyle: { backgroundColor: "transparent" },
};

const Schema = Yup.object().shape({
  titulo: Yup.string().trim().required("Requerido"),
  ref: Yup.string().trim().required("Requerido"),
  cliente: Yup.string().trim().required("Requerido"),
  fechaFin: Yup.string()
    .trim()
    .matches(/^$|^\d{2}\/\d{2}\/\d{4}$/, "Formato dd/mm/aaaa"),
  descripcion: Yup.string().trim().notRequired(),
});

export default function NuevoTramiteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const s = useMemo(() => mkStyles(theme), [theme]);

  const [filesCount] = useState(0);

  const initialValues = useMemo(
    () => ({
      titulo: "",
      ref: "",
      cliente: "",
      fechaFin: "",
      estado: "Pendiente",
      descripcion: "",
    }),
    []
  );

  const toISO = (d) => {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((d || "").trim());
    if (!m) return null;
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  };

  const onClose = (dirty) => {
    if (dirty) {
      Alert.alert(
        "Cambios sin guardar",
        "Tienes cambios sin guardar. ¿Cerrar y perder los cambios?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Cerrar",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  // Keep consistent spacing with NuevoCliente (button height estimate)
  const SAVE_BTN_HEIGHT = theme.button?.height ?? 56;
  const SAVE_BAR_PADDING_ESTIMATE = SAVE_BTN_HEIGHT + (theme.spacing?.lg ?? 24);

  return (
    <SafeAreaView style={s.backdrop} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={s.card}>
          <View style={s.header}>
            <View style={s.headerTop}>
              <Text style={s.title}>Nuevo Trámite</Text>
              <Pressable
                onPress={() => onClose(false)}
                hitSlop={theme.hitSlop}
                style={s.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
              >
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </Pressable>
            </View>
          </View>

          <Formik
            initialValues={initialValues}
            validationSchema={Schema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                setSubmitting(true);

                const payload = {
                  id: `t-${Date.now()}`,
                  titulo: String(values.titulo || "").trim(),
                  ref: String(values.ref || "")
                    .trim()
                    .toUpperCase(),
                  cliente: String(values.cliente || "").trim(),
                  fechaInicio: null,
                  fechaFinEstimada: toISO(values.fechaFin) || null,
                  estado: values.estado,
                  descripcion: String(values.descripcion || "").trim(),
                  adjuntos: [],
                  createdAt: new Date().toISOString(),
                };

                DeviceEventEmitter.emit("tramite:created", payload);
                Alert.alert("Listo", "Trámite creado correctamente.");
                router.back();
              } catch (e) {
                console.error(e);
                Alert.alert(
                  "Error",
                  e?.message || "No se pudo crear el trámite."
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
              setFieldValue,
            }) => {
              const canSave =
                !!String(values.titulo || "").trim() &&
                !!String(values.ref || "").trim() &&
                !!String(values.cliente || "").trim();

              return (
                <>
                  <ScrollView
                    contentContainerStyle={[
                      s.content,
                      {
                        paddingBottom:
                          (theme.spacing?.xxl ?? 20) +
                          SAVE_BAR_PADDING_ESTIMATE +
                          insets.bottom,
                      },
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    <Label s={s}>Título: *</Label>
                    <Input
                      s={s}
                      placeholder="Ej: Compraventa Inmuebles"
                      value={values.titulo}
                      onChangeText={handleChange("titulo")}
                      onBlur={handleBlur("titulo")}
                    />
                    {!!errors.titulo && touched.titulo && (
                      <Text style={s.fieldError}>{errors.titulo}</Text>
                    )}

                    <Label s={s}>Referencia: *</Label>
                    <Input
                      s={s}
                      placeholder="Ej: CV-2025-0037"
                      value={values.ref}
                      onChangeText={(v) =>
                        setFieldValue("ref", String(v).toUpperCase())
                      }
                      onBlur={handleBlur("ref")}
                      autoCapitalize="characters"
                    />
                    {!!errors.ref && touched.ref && (
                      <Text style={s.fieldError}>{errors.ref}</Text>
                    )}

                    <Label s={s}>Cliente: *</Label>
                    <Input
                      s={s}
                      placeholder="Ej: Miguel Yesan"
                      value={values.cliente}
                      onChangeText={handleChange("cliente")}
                      onBlur={handleBlur("cliente")}
                    />
                    {!!errors.cliente && touched.cliente && (
                      <Text style={s.fieldError}>{errors.cliente}</Text>
                    )}

                    <Label s={s}>Fecha Fin Estimada</Label>
                    <Input
                      s={s}
                      placeholder="dd/mm/aaaa"
                      value={values.fechaFin}
                      onChangeText={handleChange("fechaFin")}
                      onBlur={handleBlur("fechaFin")}
                      keyboardType={
                        Platform.OS === "ios"
                          ? "numbers-and-punctuation"
                          : "numeric"
                      }
                    />
                    {!!errors.fechaFin && touched.fechaFin && (
                      <Text style={s.fieldError}>{errors.fechaFin}</Text>
                    )}

                    <Label s={s}>Estado</Label>
                    <View style={s.chipsRow}>
                      {["Pendiente", "En Proceso", "Completado"].map((st) => (
                        <Pressable
                          key={st}
                          onPress={() => setFieldValue("estado", st)}
                          style={({ pressed }) => [
                            s.chip,
                            values.estado === st && s.chipActive,
                            pressed &&
                              !(values.estado === st) && {
                                opacity: theme.opacity.pressed,
                              },
                          ]}
                          accessibilityRole="button"
                          accessibilityState={{
                            selected: values.estado === st,
                          }}
                          hitSlop={theme.hitSlop}
                        >
                          <Text
                            style={[
                              s.chipText,
                              values.estado === st && s.chipTextActive,
                            ]}
                          >
                            {st}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Label s={s}>Documentos</Label>
                    <Pressable
                      onPress={() =>
                        Alert.alert(
                          "Pendiente",
                          "Integrar selector de archivos"
                        )
                      }
                      style={({ pressed }) => [
                        s.attachBtn,
                        pressed && { opacity: theme.opacity.pressed },
                      ]}
                      hitSlop={theme.hitSlop}
                    >
                      <Ionicons
                        name="attach"
                        size={18}
                        color={theme.colors.secondary}
                      />
                      <Text style={s.attachText}>
                        {filesCount
                          ? `${filesCount} archivo(s)`
                          : "Adjuntar archivos"}
                      </Text>
                    </Pressable>

                    <Label s={s}>Descripción</Label>
                    <TextInput
                      placeholder="Describe el trámite..."
                      placeholderTextColor={s.placeholderColor}
                      value={values.descripcion}
                      onChangeText={handleChange("descripcion")}
                      onBlur={handleBlur("descripcion")}
                      multiline
                      numberOfLines={4}
                      style={[
                        s.input,
                        { height: 120, textAlignVertical: "top" },
                      ]}
                    />
                  </ScrollView>

                  <View
                    style={[
                      s.saveBar,
                      s.saveBarShadow,
                      {
                        paddingBottom: insets.bottom + (theme.spacing?.sm ?? 8),
                      },
                    ]}
                  >
                    <Button
                      title={isSubmitting ? "Creando..." : "Crear Trámite"}
                      onPress={handleSubmit}
                      disabled={!canSave || isSubmitting}
                      fullWidth
                      variant="secondary"
                      leftIcon={
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={theme.colors.onSecondary}
                        />
                      }
                    />
                  </View>
                </>
              );
            }}
          </Formik>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* helpers */
function Label({ children, s }) {
  return <Text style={s.label}>{children}</Text>;
}
function Input({ s, ...props }) {
  return (
    <TextInput
      placeholderTextColor={s.placeholderColor}
      {...props}
      style={[s.input, props.style]}
    />
  );
}

/* styles: same design language que NuevoCliente */
const mkStyles = (theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: theme.colors.overlay,
    },
    card: {
      width: "95%",
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
    },
    closeBtn: {
      height: 36,
      width: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
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
    placeholderColor: theme.colors.textMuted,
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
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
    attachBtn: {
      height: 44,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },
    attachText: {
      fontSize: theme.font.body,
      color: theme.colors.secondary,
      fontWeight: "700",
    },
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
      paddingTop: 12,
      paddingHorizontal: theme.spacing.lg,
    },
    fieldError: {
      color: theme.colors.error,
      marginTop: 6,
      fontSize: theme.font.small,
    },
  });
