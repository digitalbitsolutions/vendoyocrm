// app/(auth)/forget.jsx
import { useState, useEffect, useMemo } from "react";
import { View, Text, Keyboard, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Formik } from "formik";
import * as Yup from "yup";
import { useRouter } from "expo-router";

import { useTheme } from "../../src/style/theme";
import { TextField } from "../../src/components/TextField";
import { Button } from "../../src/components/Button";
import { InlineMessage } from "../../src/components/InlineMessage";
import { sendPasswordReset } from "../../src/services/auth";

// ✅ mismo logo que login/register
const LOGO = require("../../assets/images/brand/logo-dark.webp");

const COOLDOWN_SECONDS = 30;

// Validación del formulario
const schema = Yup.object({
  email: Yup.string()
    .email("Email no válido")
    .required("El e-mail es obligatorio"),
});

export default function Forget() {
  const router = useRouter();
  const { theme } = useTheme(); // solo spacing/radius/fonts

  const s = useMemo(() => mkStyles(theme), [theme]);

  // 🎨 fondo corporativo FIJO (no depende de dark/light)
  const brandBg = "#36AAA7";

  const [sent, setSent] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => setCooldown((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  return (
    <View style={[s.bg, { backgroundColor: brandBg }]}>
      <SafeAreaView style={s.bg} edges={["top", "bottom"]}>
        <KeyboardAwareScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraScrollHeight={24}
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Card blanca */}
          <View style={s.card}>
            {/* Header con logo + tagline + títulos */}
            <View style={s.header}>
              <Image source={LOGO} style={s.logo} resizeMode="contain" />

              <Text style={s.tagline}>Inmobiliaria con tarifa plana</Text>

              <Text style={s.title}>¿Olvidaste tu contraseña?</Text>
              <Text style={s.subtitle}>
                Escribe tu e-mail y te enviaremos un enlace para restablecerla.
              </Text>
            </View>

            {/* Mensaje de éxito */}
            {sent && (
              <InlineMessage
                type="success"
                style={{ marginBottom: theme.spacing.md }}
              >
                <Text>
                  Te enviamos un enlace a{" "}
                  <Text style={{ fontWeight: "700" }}>{emailSentTo}</Text>.
                  Revisa tu bandeja de entrada o spam.
                </Text>
              </InlineMessage>
            )}

            {/* Formulario */}
            <Formik
              initialValues={{ email: "" }}
              validationSchema={schema}
              onSubmit={async (values, helpers) => {
                Keyboard.dismiss();
                try {
                  await sendPasswordReset(values.email);
                  setEmailSentTo(values.email);
                  setSent(true);
                  setCooldown(COOLDOWN_SECONDS);
                  helpers.setSubmitting(false);
                } catch (e) {
                  helpers.setSubmitting(false);
                  helpers.setFieldError(
                    "email",
                    e?.message ||
                      "No pudimos enviar el correo. Inténtalo más tarde."
                  );
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
              }) => (
                <>
                  <TextField
                    label="E-mail"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    error={touched.email && errors.email}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                    returnKeyType="send"
                    onSubmitEditing={handleSubmit}
                    forceLight
                  />

                  <Button
                    title={
                      isSubmitting
                        ? "Enviando..."
                        : cooldown > 0
                        ? `Reenviar enlace (${cooldown}s)`
                        : sent
                        ? "Reenviar enlace"
                        : "ENVIAR ENLACE"
                    }
                    onPress={handleSubmit}
                    disabled={
                      isSubmitting ||
                      !values.email ||
                      !!errors.email ||
                      cooldown > 0
                    }
                    variant="primary"
                    fullWidth
                  />

                  <View style={s.links}>
                    <Text
                      style={s.link}
                      onPress={() => router.push("/(auth)/login")}
                    >
                      Volver al inicio de sesión
                    </Text>
                  </View>
                </>
              )}
            </Formik>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}

// ---------- Estilos: auth SIEMPRE claro ----------
const mkStyles = (theme) =>
  StyleSheet.create({
    bg: { flex: 1 },

    scroll: {
      flexGrow: 1,
      padding: theme.spacing.lg,
      justifyContent: "center",
      alignItems: "center",
    },

    card: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: "#FFFFFF", // siempre blanco
      borderRadius: theme.radius.xl,
      padding: theme.spacing.xl,
      ...theme.shadow,
      borderWidth: 1,
      borderColor: "#E5E7EB", // gris claro fijo
    },

    header: {
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },

    logo: {
      width: 170,
      height: 110,
      marginBottom: -40,
    },

    tagline: {
      color: "#111827",
      fontSize: theme.font.tiny,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 0,
      marginBottom: theme.spacing.xxl,
    },

    title: {
      color: "#111827",
      fontSize: theme.font.h2,
      fontWeight: "800",
      textAlign: "center",
    },

    subtitle: {
      marginTop: 4,
      fontSize: theme.font.small,
      color: "#4B5563",
      textAlign: "center",
    },

    links: {
      alignItems: "center",
      marginTop: theme.spacing.lg,
    },
    link: {
      color: "#E53935",
      fontWeight: "700",
      fontSize: theme.font.small,
    },
  });
