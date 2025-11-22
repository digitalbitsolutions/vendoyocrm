// app/(app)/perfil/seguridad.jsx
import React, {
  useCallback,
  useState,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput as TextInputNative,
  BackHandler,
  Pressable,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";

import AppBar from "../../../src/components/AppBar";
import { useTheme } from "../../../src/style/theme";
import { Button } from "../../../src/components/Button";
import { changePassword } from "../../../src/services/security";

/* --- Schema de validación (Yup) --- */
const Schema = Yup.object().shape({
  currentPassword: Yup.string().required("Requerido"),
  newPassword: Yup.string().min(6, "Mínimo 6 caracteres").required("Requerido"),
  confirm: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Las contraseñas no coinciden")
    .required("Requerido"),
});

/* --- Helper: calculadora simple de fuerza de contraseña --- */
function passwordStrength(pw = "") {
  let score = 0;
  if (!pw) return { score: 0, label: "Muy débil" };
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  const labels = ["Muy débil", "Débil", "Aceptable", "Fuerte", "Muy fuerte"];
  return { score, label: labels[Math.min(score, labels.length - 1)] };
}

/* --- Campo genérico (label + error) --- */
function Field({ label, error, children, theme }) {
  const fs = useMemo(
    () =>
      StyleSheet.create({
        wrap: { marginBottom: theme.spacing.md },
        label: {
          color: theme.colors.text,
          fontWeight: "700",
          marginBottom: 6,
        },
        error: { color: theme.colors.error, marginTop: 6 },
      }),
    [theme]
  );

  return (
    <View style={fs.wrap}>
      {!!label && <Text style={fs.label}>{label}</Text>}
      {children}
      {!!error && <Text style={fs.error}>{error}</Text>}
    </View>
  );
}

/* --- Pantalla principal --- */
export default function SeguridadScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const s = mkStyles(theme);

  const goProfile = useCallback(() => {
    router.replace("/(app)/perfil");
  }, [router]);

  /* Manejo hardware back (Android) */
  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        goProfile();
        return true;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
      return () => sub.remove();
    }, [goProfile])
  );

  /* UI state: show/hide passwords y animación del strength bar */
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Animated.Value guardado en ref para evitar recrearlo
  const strengthAnim = useRef(new Animated.Value(0));

  const animateStrength = useCallback((score) => {
    Animated.timing(strengthAnim.current, {
      toValue: score / 4, // normalizamos a 0..1 (4 = max score)
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <AppBar
        variant="section"
        title="Seguridad"
        showBorder={false}
        onBackPress={goProfile}
      />

      <View style={s.body}>
        <Formik
          initialValues={{ currentPassword: "", newPassword: "", confirm: "" }}
          validationSchema={Schema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              setSubmitting(true);
              const res = await changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              });

              if (res?.ok) {
                resetForm();
                Alert.alert(
                  "Hecho",
                  "Tu contraseña fue cambiada correctamente.",
                  [{ text: "OK", onPress: goProfile }]
                );
              } else {
                // Manejo de error proveniente del backend
                Alert.alert(
                  "Atención",
                  res?.message || "No se pudo cambiar la contraseña."
                );
              }
            } catch (e) {
              Alert.alert(
                "Error",
                e?.message || "No se pudo cambiar la contraseña."
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
            // calculamos fuerza una vez por render
            const strength = useMemo(
              () => passwordStrength(values.newPassword || ""),
              [values.newPassword]
            );

            // manejador que actualiza valor y anima inmediatamente (evita hooks en render)
            const onNewPasswordChange = useCallback(
              (v) => {
                setFieldValue("newPassword", v);
                const { score } = passwordStrength(v || "");
                animateStrength(score);
              },
              [setFieldValue, animateStrength]
            );

            return (
              <View style={s.form}>
                {/* Contraseña actual */}
                <Field
                  label="Contraseña actual"
                  error={touched.currentPassword && errors.currentPassword}
                  theme={theme}
                >
                  <View style={s.inputRow}>
                    <TextInputNative
                      value={values.currentPassword}
                      onChangeText={handleChange("currentPassword")}
                      onBlur={handleBlur("currentPassword")}
                      placeholder="••••••"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry={!showCurrent}
                      autoCapitalize="none"
                      textContentType="password"
                      autoComplete="password"
                      style={s.input}
                      accessibilityLabel="Contraseña actual"
                    />
                    <Pressable
                      onPress={() => setShowCurrent((v) => !v)}
                      hitSlop={theme.hitSlop}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showCurrent
                          ? "Ocultar contraseña actual"
                          : "Mostrar contraseña actual"
                      }
                      style={s.eyeBtn}
                    >
                      <Ionicons
                        name={showCurrent ? "eye-off" : "eye"}
                        size={18}
                        color={theme.colors.textMuted}
                      />
                    </Pressable>
                  </View>
                </Field>

                {/* Nueva contraseña */}
                <Field
                  label="Nueva contraseña"
                  error={touched.newPassword && errors.newPassword}
                  theme={theme}
                >
                  <View style={s.inputRow}>
                    <TextInputNative
                      value={values.newPassword}
                      onChangeText={onNewPasswordChange}
                      onBlur={handleBlur("newPassword")}
                      placeholder="Mínimo 6 caracteres"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry={!showNew}
                      autoCapitalize="none"
                      textContentType="newPassword"
                      autoComplete="new-password"
                      style={s.input}
                      accessibilityLabel="Nueva contraseña"
                    />
                    <Pressable
                      onPress={() => setShowNew((v) => !v)}
                      hitSlop={theme.hitSlop}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showNew
                          ? "Ocultar nueva contraseña"
                          : "Mostrar nueva contraseña"
                      }
                      style={s.eyeBtn}
                    >
                      <Ionicons
                        name={showNew ? "eye-off" : "eye"}
                        size={18}
                        color={theme.colors.textMuted}
                      />
                    </Pressable>
                  </View>

                  {/* Medidor de fuerza */}
                  <View style={s.strengthRow}>
                    <View style={s.strengthLabelWrap}>
                      <Text style={s.strengthLabelText}>{strength.label}</Text>
                    </View>
                    <View
                      style={s.strengthBarBg}
                      accessible
                      accessibilityRole="progressbar"
                      accessibilityLabel={`Fuerza: ${strength.label}`}
                    >
                      <Animated.View
                        style={[
                          s.strengthBarFill,
                          {
                            width: strengthAnim.current.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0%", "100%"],
                            }),
                            backgroundColor:
                              (values.newPassword || "").length === 0
                                ? theme.colors.border
                                : strength.score >= 3
                                ? theme.colors.success
                                : strength.score === 2
                                ? theme.colors.warning
                                : theme.colors.danger,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </Field>

                {/* Confirmar */}
                <Field
                  label="Confirmar nueva contraseña"
                  error={touched.confirm && errors.confirm}
                  theme={theme}
                >
                  <View style={s.inputRow}>
                    <TextInputNative
                      value={values.confirm}
                      onChangeText={handleChange("confirm")}
                      onBlur={handleBlur("confirm")}
                      placeholder="Repite la nueva contraseña"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry={!showConfirm}
                      autoCapitalize="none"
                      textContentType="newPassword"
                      autoComplete="new-password"
                      style={s.input}
                      accessibilityLabel="Confirmar nueva contraseña"
                    />
                    <Pressable
                      onPress={() => setShowConfirm((v) => !v)}
                      hitSlop={theme.hitSlop}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showConfirm
                          ? "Ocultar confirmación"
                          : "Mostrar confirmación"
                      }
                      style={s.eyeBtn}
                    >
                      <Ionicons
                        name={showConfirm ? "eye-off" : "eye"}
                        size={18}
                        color={theme.colors.textMuted}
                      />
                    </Pressable>
                  </View>
                </Field>

                {/* Botón guardar */}
                <Button
                  title={isSubmitting ? "Guardando..." : "Guardar"}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  variant="primary"
                  fullWidth
                  leftIcon={
                    <Ionicons
                      name="save-outline"
                      size={18}
                      color={theme.colors.onAccent}
                    />
                  }
                />
              </View>
            );
          }}
        </Formik>
      </View>
    </SafeAreaView>
  );
}

/* ---------- Estilos ---------- */
const mkStyles = (theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    body: { padding: theme.spacing.lg, gap: theme.spacing.lg },

    form: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      ...theme.shadow,
    },

    inputRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    input: {
      flex: 1,
      height: 48,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      paddingHorizontal: 12,
    },
    eyeBtn: {
      marginLeft: 8,
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },

    strengthRow: {
      marginTop: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    strengthLabelWrap: {
      minWidth: 90,
    },
    strengthLabelText: {
      fontSize: theme.font.small,
      color: theme.colors.textMuted,
      fontWeight: "700",
    },
    strengthBarBg: {
      flex: 1,
      height: 8,
      borderRadius: 6,
      backgroundColor: theme.colors.border,
      overflow: "hidden",
    },
    strengthBarFill: {
      height: "100%",
      width: "0%",
      borderRadius: 6,
    },
  });
