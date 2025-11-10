import { useState, useMemo } from "react";                                   
import {
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";

// ⬇️ CHANGED: usar tema reactivo
import { useTheme } from "../../src/style/theme";                             
import { TextField } from "../../src/components/TextField";
import { Button } from "../../src/components/Button";
import { useAuth } from "../../src/context/AuthContext"; 

const BG   = require("../../assets/images/Hero/background.png");
const LOGO = require("../../assets/images/login/logo.png");

// Validación
const schema = Yup.object({
  email: Yup.string().email("E-mail no válido").required("El e-mail es obligatorio"),
  password: Yup.string().min(6, "Mínimo 6 caracteres").required("La contraseña es obligatoria"),
});

export default function Login() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const { theme, mode } = useTheme();                                          
  const s = useMemo(() => mkStyles(theme), [theme]);                           

  const [remember, setRemember] = useState(false);

  if (isLoading) return null; // evita flicker mientras restaura sesión del storage

  return (
    <ImageBackground source={BG} style={s.bg} resizeMode="cover">
      {/* velo: más fuerte en dark para contraste */}
      <View style={[s.scrim, mode === "dark" && { backgroundColor: "rgba(0,0,0,0.35)" }]} />

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
            {/* Tarjeta centrada */}
            <View style={s.card}>
              {/* Encabezado con logo y título */}
              <View style={s.header}>
                <Image source={LOGO} style={s.logo} resizeMode="contain" />
                <Text style={s.title}>Iniciar Sesión</Text>
              </View>

              {/* Formulario */}
              <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={schema}
                onSubmit={async (values, helpers) => {
                  try {
                    await signIn({ email: values.email, password: values.password, remember }); 
                    router.replace("/(app)/dashboard");
                  } catch (e) {
                    helpers.setSubmitting(false);
                    helpers.setFieldError("email", e?.message || "Credenciales inválidas");
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
                      keyboardType="email-address"
                      autoComplete="email"
                      returnKeyType="next"
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
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                    />

                    {/* Recordar sesión */}
                    <View style={s.row}>
                      <Switch
                        value={remember}
                        onValueChange={setRemember}
                        trackColor={{ false: theme.colors.border, true: theme.colors.secondary }}
                        thumbColor={theme.colors.surface}                                         
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
                      <Text style={s.link} onPress={() => router.push("/(auth)/register")}>
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
    </ImageBackground>
  );
}

// ---------- Estilos dependientes del tema ----------
const mkStyles = (theme) =>
  StyleSheet.create({
    bg: { flex: 1 },
    scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.08)" },
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
      borderWidth: 1,                                                        
      borderColor: theme.colors.border,                                      
    },
    header: {
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    logo: {
      width: 180,
      height: 180,
      marginBottom: theme.spacing.sm,
      ...theme.shadow,
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
