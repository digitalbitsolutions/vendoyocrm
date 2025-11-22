// app/(auth)/register.jsx
import { useMemo } from "react";
import { View, Text, Switch, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useTheme } from "../../src/style/theme";
import { TextField } from "../../src/components/TextField";
import { Button } from "../../src/components/Button";
import { useAuth } from "../../src/context/AuthContext";

// ✅ mismo logo que en login (turquesa sobre blanco)
const LOGO = require("../../assets/images/brand/logo-dark.webp");

// Validación
const schema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Escribe tu nombre completo")
    .required("El nombre es obligatorio"),
  email: Yup.string()
    .email("E-mail no válido")
    .required("El e-mail es obligatorio"),
  password: Yup.string()
    .min(6, "Mínimo 6 caracteres")
    .required("La contraseña es obligatoria"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Las contraseñas no coinciden")
    .required("Confirma tu contraseña"),
  acceptTerms: Yup.boolean().oneOf([true], "Debes aceptar los términos"),
});

export default function Register() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const { theme } = useTheme(); // solo para spacing/radius/fonts

  const s = useMemo(() => mkStyles(theme), [theme]);

  // 🎨 fondo corporativo FIJO (no depende de dark/light)
  const brandBg = "#36AAA7";

  if (isLoading) return null;

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
          {/* Card de registro */}
          <View style={s.card}>
            {/* Header con logo + tagline + título */}
            <View style={s.header}>
              <Image source={LOGO} style={s.logo} resizeMode="contain" />

              <Text style={s.tagline}>Inmobiliaria con tarifa plana</Text>

              <Text style={s.title}>Crear cuenta</Text>
            </View>

            <Formik
              initialValues={{
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                acceptTerms: false,
              }}
              validationSchema={schema}
              onSubmit={async (values, helpers) => {
                try {
                  await signUp({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                  });
                  router.replace("/(auth)/login");
                } catch (e) {
                  helpers.setSubmitting(false);
                  helpers.setFieldError(
                    "email",
                    e.message || "No se puede crear la cuenta"
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
                setFieldValue,
              }) => (
                <>
                  <TextField
                    label="Nombre completo"
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    error={touched.name && errors.name}
                    autoComplete="name"
                    returnKeyType="next"
                    forceLight
                  />

                  <TextField
                    label="E-mail"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    error={touched.email && errors.email}
                    keyboardType="email-address"
                    autoComplete="email"
                    returnKeyType="next"
                    forceLight
                  />

                  <TextField
                    label="Contraseña"
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    error={touched.password && errors.password}
                    secureTextEntry
                    textContentType="password"
                    autoComplete="off"
                    importantForAutofill="no"
                    returnKeyType="next"
                    style={{ marginTop: theme.spacing.sm }}
                    forceLight
                  />

                  <TextField
                    label="Confirmar contraseña"
                    value={values.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    error={touched.confirmPassword && errors.confirmPassword}
                    secureTextEntry
                    textContentType="password"
                    autoComplete="off"
                    importantForAutofill="no"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    forceLight
                  />

                  {/* Aceptar términos */}
                  <View style={s.row}>
                    <Switch
                      value={values.acceptTerms}
                      onValueChange={(v) => setFieldValue("acceptTerms", v)}
                      trackColor={{
                        false: "#E5E7EB", // gris fijo
                        true: "#0F4C4A", // verde petróleo fijo
                      }}
                      thumbColor="#FFFFFF"
                    />
                    <Text style={s.rowText}>
                      Acepto los términos y la Política de Privacidad
                    </Text>
                  </View>

                  <Button
                    title={isSubmitting ? "Creando cuenta..." : "CREAR CUENTA"}
                    onPress={handleSubmit}
                    disabled={
                      isSubmitting ||
                      !values.name ||
                      !values.email ||
                      !values.password ||
                      !values.confirmPassword ||
                      !!errors.name ||
                      !!errors.email ||
                      !!errors.password ||
                      !!errors.confirmPassword ||
                      !values.acceptTerms
                    }
                    variant="primary"
                    fullWidth
                  />

                  <View style={s.links}>
                    <Text
                      style={s.link}
                      onPress={() => router.push("/(auth)/login")}
                    >
                      Ya tengo cuenta
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
      fontSize: theme.font.h1,
      fontWeight: "800",
      textAlign: "center",
    },

    subtitle: {
      marginTop: 4,
      fontSize: theme.font.small,
      color: "#4B5563",
      textAlign: "center",
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    rowText: {
      color: "#111827",
      fontSize: theme.font.small,
      flex: 1,
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
