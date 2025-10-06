import { useState } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  Image,
  Switch,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";

import { theme } from "../src/style/theme";
import { TextField } from "../src/components/TextField";
import { Button } from "../src/components/Button";

// ⬇️ usa el mismo fondo del Hero
const BG = require("../assets/images/Hero/background.png");

// ⬇️ logo “tal cual” (sin fondo blanco; es tu PNG)
const LOGO = require("../assets/images/login/logo.png");

// Validación
const schema = Yup.object({
  email: Yup.string().email("E-mail no válido").required("El e-mail es obligatorio"),
  password: Yup.string().min(6, "Mínimo 6 caracteres").required("La contraseña es obligatoria"),
});

export default function Login() {
  const router = useRouter();
  const [remember, setRemember] = useState(false);

  // Simulación de login (aquí conectarás tu API)
  const mockLogin = async (values) => {
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true }; // <- antes ponías "tru"
  };

  return (
    <ImageBackground source={BG} style={s.bg} resizeMode="cover">
      {/* velo muy suave para que el card destaque (puedes quitarlo si no lo quieres) */}
      <View style={s.scrim} />

      <SafeAreaView style={s.bg}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })} // <- antes "behavion"
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Tarjeta blanca centrada */}
            <View style={s.card}>
              {/* Encabezado con logo y título */}
              <View style={s.header}>
                {/* ⬇️ logo tal cual, sin círculo */}
                <Image source={LOGO} style={s.logo} resizeMode="contain" />
                {/* El “VendoYo.es” ya va dentro del logo, así que solo dejo el título */}
                <Text style={s.title}>Iniciar Sesión</Text>
              </View>

              {/* Formulario */}
              <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={schema}
                onSubmit={async (values, helpers) => {
                  const res = await mockLogin(values); // <- antes "rees"
                  if (res.ok) {
                    // TODO: guardar token y remember si aplica
                    router.replace("/"); // navega a home/dashboard
                  } else {
                    helpers.setSubmitting(false);
                    helpers.setFieldError("email", "Credenciales inválidas");
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
                      placeholder=""
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      error={touched.email && errors.email}
                      keyboardType="email-address"   // <- antes "keyBoardType"
                      autoComplete="email"
                    />

                    <TextField
                      label="Contraseña"
                      placeholder=""
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      error={touched.password && errors.password}
                      secureTextEntry
                      autoComplete="password"
                      style={{ marginTop: theme.spacing.sm }}
                    />

                    {/* Recordar sesión */}
                    <View style={s.row}>
                      <Switch
                        value={remember}
                        onValueChange={setRemember}
                        trackColor={{ false: "#d1d5db", true: theme.colors.secondary }}
                        thumbColor="#fff"
                      />
                      <Text style={s.rowText}>Recordar sesión</Text>
                    </View>

                    {/* Botón amarillo */}
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
                    />

                    {/* Enlaces */}
                    <View style={s.links}>
                      <Text style={s.link} onPress={() => router.push("/register")}>
                        Registrarse
                      </Text>
                      <Text
                        style={[s.link, { marginTop: theme.spacing.sm }]} // <- antes "margintop"
                        onPress={() => router.push("/forget")}
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
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.06)" },
  scroll: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    ...theme.shadow,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.h1,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.md,
  },
  rowText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: theme.font.small,
  },
  links: {
    alignItems: "center",
    marginTop: theme.spacing.lg,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: theme.font.small,
  },
});
