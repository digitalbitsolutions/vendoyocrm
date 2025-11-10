import { useMemo } from "react";
import {
  View, Text, Image, Switch, StyleSheet, ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// ⬇️ Tema dinámico + componentes reutilizables
import { useTheme } from "../../src/style/theme";
import { TextField } from "../../src/components/TextField";
import { Button } from "../../src/components/Button";
import { useAuth } from "../../src/context/AuthContext";

// Imágenes (mismo fondo y logo que el login)
const BG = require("../../assets/images/Hero/background.png");
const LOGO = require("../../assets/images/login/logo.png");

// Validación
const schema = Yup.object({
  name: Yup.string().trim().min(2, "Escribe tu nombre completo").required("El nombre es obligatorio"),
  email: Yup.string().email("E-mail no válido").required("El e-mail es obligatorio"),
  password: Yup.string().min(6, "Mínimo 6 caracteres").required("La contraseña es obligatoria"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Las contraseñas no coinciden").required("Confirma tu contraseña"),
  acceptTerms: Yup.boolean().oneOf([true], "Debes aceptar los términos"),
});

export default function Register() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const { theme, mode } = useTheme();                // ✅ tema y modo actual
  const s = useMemo(() => mkStyles(theme), [theme]); // ✅ estilos dependientes del tema

  if (isLoading) return null;

  return (
    <ImageBackground source={BG} style={s.bg} resizeMode="cover">
      {/* Scrim: un poco más oscuro en modo dark para contraste */}
      <View
        style={[
          s.scrim,
          mode === "dark" && { backgroundColor: "rgba(0,0,0,0.35)" },
        ]}
      />

      <SafeAreaView style={s.bg} edges={["top", "bottom"]}>
        <KeyboardAwareScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraScrollHeight={24}
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.centerer}>
            <View style={s.card}>
              {/* Cabecera */}
              <View style={s.header}>
                <Image source={LOGO} style={s.logo} resizeMode="contain" />
                <Text style={s.title}>Crear cuenta</Text>
                <Text style={s.subtitle}>
                  Regístrate para comenzar a usar VendoYo.es
                </Text>
              </View>

              {/* Formulario */}
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
                    router.replace("/"); // vuelve al Gate (redirecciona a (app) o (auth))
                  } catch (e) {
                    helpers.setSubmitting(false);
                    helpers.setFieldError("email", e.message || "No se puede crear la cuenta");
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
                    />

                    {/* Switch: Aceptar términos */}
                    <View style={s.row}>
                      <Switch
                        value={values.acceptTerms}
                        onValueChange={(v) => setFieldValue("acceptTerms", v)}
                        trackColor={{ false: theme.colors.border, true: theme.colors.secondary }} 
                        thumbColor={theme.colors.surface}                                       
                      />
                      <Text style={s.rowText}>
                        Acepto los términos y la Política de Privacidad
                      </Text>
                    </View>

                    {/* Botón: CREAR CUENTA */}
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
                      fullWidth  // ✅ ocupa todo el ancho del card
                    />

                    {/* Enlaces */}
                    <View style={s.links}>
                      <Text
                        style={s.link}
                        onPress={() => router.push("/(auth)/login")} // ✅ ruta corregida
                      >
                        Ya tengo cuenta
                      </Text>
                    </View>
                  </>
                )}
              </Formik>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// ---------- Estilos dependientes del tema ----------
const mkStyles = (theme) =>
  StyleSheet.create({
    bg: { flex: 1 },
    scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.6)" },
    scroll: {
      flexGrow: 1,
      padding: theme.spacing.lg,
    },
    centerer: {
      flexGrow: 1,
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
      borderWidth: 1,                  
      borderColor: theme.colors.border 
    },
    header: {
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    logo: {
      width: 160,
      height: 160,
      marginBottom: theme.spacing.sm,
      ...theme.shadow,
    },
    title: {
      color: theme.colors.text,
      fontSize: theme.font.h1,
      fontWeight: "800",
    },
    subtitle: {
      marginTop: 6,
      fontSize: theme.font.small,
      color: theme.colors.textMuted,
      textAlign: "center",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: theme.spacing.md,
      gap: theme.spacing.sm,
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
