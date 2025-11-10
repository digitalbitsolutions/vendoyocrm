import React, { useCallback } from "react";
import { View, Text, StyleSheet, Alert, TextInput as TextInputNative, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";

import AppBar from "../../../src/components/AppBar";
import { useTheme } from "../../../src/style/theme";
import { Button } from "../../../src/components/Button";
import { changePassword } from "../../../src/services/security";

const Schema = Yup.object().shape({
  currentPassword: Yup.string().required("Requerido"),
  newPassword: Yup.string().min(6, "Mínimo 6 caracteres").required("Requerido"),
  confirm: Yup.string().oneOf([Yup.ref("newPassword")], "Las contraseñas no coinciden").required("Requerido"),
});

function Field({ label, error, children }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      {!!label && <Text style={{ color: theme.colors.text, fontWeight: "700", marginBottom: 6 }}>{label}</Text>}
      {children}
      {!!error && <Text style={{ color: theme.colors.error, marginTop: 6 }}>{error}</Text>}
    </View>
  );
}

export default function SeguridadScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const s = mkStyles(theme);

  const goProfile = useCallback(() => {
    router.replace("/(app)/perfil");
  }, [router]);

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

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <AppBar variant="section" title="Seguridad" showBorder={false} onBackPress={goProfile} />

      <View style={s.body}>
        <Formik
          initialValues={{ currentPassword: "", newPassword: "", confirm: "" }}
          validationSchema={Schema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              const res = await changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              });
              if (res?.ok) {
                resetForm();
                Alert.alert("Hecho", "Tu contraseña fue cambiada correctamente.", [
                  { text: "OK", onPress: goProfile },
                ]);
              } else {
                Alert.alert("Atención", "No se pudo cambiar la contraseña.");
              }
            } catch (e) {
              Alert.alert("Error", e?.message || "No se pudo cambiar la contraseña.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View style={s.form}>
              <Field label="Contraseña actual" error={touched.currentPassword && errors.currentPassword}>
                <TextInputNative
                  value={values.currentPassword}
                  onChangeText={handleChange("currentPassword")}
                  onBlur={handleBlur("currentPassword")}
                  placeholder="••••••"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="password"
                  autoComplete="password"
                  style={s.input}
                />
              </Field>

              <Field label="Nueva contraseña" error={touched.newPassword && errors.newPassword}>
                <TextInputNative
                  value={values.newPassword}
                  onChangeText={handleChange("newPassword")}
                  onBlur={handleBlur("newPassword")}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="newPassword"
                  autoComplete="new-password"
                  style={s.input}
                />
              </Field>

              <Field label="Confirmar nueva contraseña" error={touched.confirm && errors.confirm}>
                <TextInputNative
                  value={values.confirm}
                  onChangeText={handleChange("confirm")}
                  onBlur={handleBlur("confirm")}
                  placeholder="Repite la nueva contraseña"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="newPassword"
                  autoComplete="new-password"
                  style={s.input}
                />
              </Field>

              <Button
                title={isSubmitting ? "Guardando..." : "Guardar"}
                onPress={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
                variant="primary"
                fullWidth
                leftIcon={<Ionicons name="save-outline" size={18} color={theme.colors.onAccent} />}
              />
            </View>
          )}
        </Formik>
      </View>
    </SafeAreaView>
  );
}

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
    input: {
      height: 48,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      paddingHorizontal: 12,
    },
  });
