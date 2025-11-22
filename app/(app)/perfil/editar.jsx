// app/(app)/perfil/editar.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput as TextInputNative,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import * as Yup from "yup";

import AppBar from "../../../src/components/AppBar";
import { useTheme } from "../../../src/style/theme";
import { Button } from "../../../src/components/Button";
import { getProfile, updateProfile } from "../../../src/services/profile";

/* ---------- Validation schema (Yup) ---------- */
const Schema = Yup.object().shape({
  name: Yup.string().trim().required("Requerido"),
  email: Yup.string().trim().email("Email inválido").required("Requerido"),
  phone: Yup.string()
    .trim()
    .notRequired()
    .test("len-or-empty", "Teléfono inválido", (v) => {
      if (!v) return true;
      const digits = v.replace(/\D/g, "");
      return digits.length >= 6 && digits.length <= 15;
    }),
});

/* ---------- Small helper Field (presentational) ---------- */
function Field({ label, error, children }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      {!!label && (
        <Text
          style={{
            color: theme.colors.text,
            fontWeight: "700",
            marginBottom: 6,
            fontSize: theme.font.body,
          }}
        >
          {label}
        </Text>
      )}
      {children}
      {!!error && (
        <Text style={{ color: theme.colors.error, marginTop: 6 }}>{error}</Text>
      )}
    </View>
  );
}

/* ---------- Main component ---------- */
export default function EditarPerfilScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const s = mkStyles(theme);

  const isMounted = useRef(true); // evita setState después de un unmount
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------- Load profile safely ---------- */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const p = await getProfile();
      if (isMounted.current) {
        setInitial({
          name: p?.name || "",
          email: p?.email || "",
          phone: p?.phone || "",
        });
      }
    } catch (e) {
      if (isMounted.current) {
        Alert.alert("Error", e?.message || "No se pudo cargar el perfil.");
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    load();
    return () => {
      isMounted.current = false;
    };
  }, [load]);

  /* ---------- Back handler (hardware) para iOS/Android ---------- */
  const goProfile = useCallback(() => {
    router.replace("/(app)/perfil");
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        goProfile();
        return true; // consumimos el evento
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
      return () => sub.remove();
    }, [goProfile])
  );

  /* ---------- Render loading state ---------- */
  if (loading || !initial) {
    return (
      <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
        <AppBar
          variant="section"
          title="Editar perfil"
          showBorder={false}
          onBackPress={goProfile}
        />
        <View
          style={[s.body, { alignItems: "center", justifyContent: "center" }]}
        >
          <ActivityIndicator size="small" color={theme.colors.secondary} />
          <Text style={{ marginTop: 8, color: theme.colors.textMuted }}>
            Cargando…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ---------- Main form ---------- */
  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <AppBar
        variant="section"
        title="Editar perfil"
        showBorder={false}
        onBackPress={goProfile}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.body}>
            <Formik
              enableReinitialize
              initialValues={initial}
              validationSchema={Schema}
              validateOnMount
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  setSubmitting(true);
                  const updated = await updateProfile({
                    name: values.name.trim(),
                    email: values.email.trim(),
                    phone: values.phone.trim(),
                  });
                  if (isMounted.current) {
                    Alert.alert(
                      "Listo",
                      "Tu perfil se actualizó correctamente.",
                      [{ text: "OK", onPress: goProfile }]
                    );
                  }
                } catch (e) {
                  if (isMounted.current) {
                    Alert.alert("Error", e?.message || "No se pudo guardar.");
                  }
                } finally {
                  if (isMounted.current) setSubmitting(false);
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
                isValid,
              }) => (
                <View style={s.form}>
                  <Field
                    label="Nombre completo"
                    error={touched.name && errors.name}
                  >
                    <TextInputNative
                      value={values.name}
                      onChangeText={handleChange("name")}
                      onBlur={handleBlur("name")}
                      placeholder="Ej: Miguel Yesan"
                      placeholderTextColor={theme.colors.textMuted}
                      style={s.input}
                      returnKeyType="next"
                      accessible
                      accessibilityLabel="Nombre completo"
                    />
                  </Field>

                  <Field label="Email" error={touched.email && errors.email}>
                    <TextInputNative
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      placeholder="tucorreo@dominio.com"
                      placeholderTextColor={theme.colors.textMuted}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={s.input}
                      returnKeyType="next"
                      accessible
                      accessibilityLabel="Correo electrónico"
                    />
                  </Field>

                  <Field label="Teléfono" error={touched.phone && errors.phone}>
                    <TextInputNative
                      value={values.phone}
                      onChangeText={handleChange("phone")}
                      onBlur={handleBlur("phone")}
                      placeholder="+34 600 000 000"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType={
                        Platform.OS === "ios"
                          ? "numbers-and-punctuation"
                          : "phone-pad"
                      }
                      style={s.input}
                      returnKeyType="done"
                      accessible
                      accessibilityLabel="Teléfono"
                    />
                  </Field>

                  <Button
                    title={isSubmitting ? "Guardando..." : "Guardar cambios"}
                    onPress={handleSubmit}
                    disabled={!isValid || isSubmitting}
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
                    accessibilityLabel="Guardar cambios de perfil"
                  />
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const mkStyles = (theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
    body: { gap: theme.spacing.lg },
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
