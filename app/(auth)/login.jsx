// app/(auth)/login.jsx
import { useState, useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  Switch,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";

import { useTheme } from "../../src/style/theme";
import { TextField } from "../../src/components/TextField";
import { Button } from "../../src/components/Button";
import { useAuth } from "../../src/context/AuthContext";

// ✅ logo turquesa sobre fondo blanco
const LOGO = require("../../assets/images/brand/logo-dark.webp");

// Validación
const schema = Yup.object({
  email: Yup.string().email("E-mail no válido").required("El e-mail es obligatorio"),
  password: Yup.string()
    .min(6, "Mínimo 6 caracteres")
    .required("La contraseña es obligatoria"),
});

export default function Login() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const { theme } = useTheme(); // solo usamos spacing/radius

  const s = useMemo(() => mkStyles(theme), [theme]);

  // 🎨 fondo corporativo FIJO para todo el auth (no depende de dark/light)
  const brandBg = "#36AAA7";

  const [remember, setRemember] = useState(false);

  if (isLoading) return null;

  return (
    <View style={[s.bg, { backgroundColor: brandBg }]}>
      <SafeAreaView style={s.bg} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* Tarjeta de login */}
            <View style={s.card}>
              {/* Header con logo + tagline + título */}
              <View style={s.header}>
                <Image source={LOGO} style={s.logo} resizeMode="contain" />

                {/* tagline pegado al logo y separado del título */}
                <Text style={s.tagline}>Inmobiliaria con tarifa plana</Text>

                <Text style={s.title}>Iniciar sesión</Text>
              </View>

              <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={schema}
                onSubmit={async (values, helpers) => {
                  try {
                    await signIn({
                      email: values.email,
                      password: values.password,
                      remember,
                    });
                    router.replace("/(app)/dashboard");
                  } catch (e) {
                    helpers.setSubmitting(false);
                    helpers.setFieldError(
                      "email",
                      e?.message || "Credenciales inválidas"
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
                      autoComplete="email"
                      returnKeyType="next"
                      // 👇 siempre claro en auth
                      forceLight
                    />

                    <TextField
                      label="Contraseña"
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      error={touched.password && errors.password}
                      secureTextEntry
                      autoComplete="password"
                      style={{ marginTop: theme.spacing.sm }}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                      // 👇 idem
                      forceLight
                    />

                    {/* Recordar sesión */}
                    <View style={s.row}>
                      <Switch
                        value={remember}
                        onValueChange={setRemember}
                        trackColor={{
                          false: "#E5E7EB", // gris fijo
                          true: "#0F4C4A",  // verde petróleo fijo
                        }}
                        thumbColor="#FFFFFF"
                      />
                      <Text style={s.rowText}>Recordar sesión</Text>
                    </View>

                    {/* CTA */}
                    <Button
                      title={isSubmitting ? "Entrando..." : "INICIAR SESIÓN"}
                      onPress={handleSubmit}
                      disabled={
                        isSubmitting ||
                        !values.email ||
                        !values.password ||
                        !!errors.email ||
                        !!errors.password
                      }
                      variant="primary"
                      fullWidth
                    />

                    {/* Enlaces */}
                    <View style={s.links}>
                      <Text
                        style={s.link}
                        onPress={() => router.push("/(auth)/register")}
                      >
                        Registrarse
                      </Text>
                      <Text
                        style={[s.link, { marginTop: theme.spacing.sm }]}
                        onPress={() => router.push("/(auth)/forget")}
                      >
                        ¿Olvidaste tu contraseña?
                      </Text>
                    </View>
                  </>
                )}
              </Formik>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const mkStyles = (theme) =>
  StyleSheet.create({
    bg: {
      flex: 1,
    },

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

    // ✅ logo más grande
    logo: {
      width: 170,
      height: 110,
      marginBottom: -40, // casi pegado al slogan
    },

    // ✅ slogan pegado al logo y separado del título
    tagline: {
      color: "#111827",
      fontSize: theme.font.tiny,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 0,                     // pegado al logo
      marginBottom: theme.spacing.xxl,   // espacio ANTES de "Iniciar sesión"
    },

    title: {
      color: "#111827",
      fontSize: theme.font.h1,
      fontWeight: "800",
      textAlign: "center",
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: theme.spacing.md,
    },
    rowText: {
      marginLeft: theme.spacing.sm,
      color: "#111827",
      fontSize: theme.font.small,
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
