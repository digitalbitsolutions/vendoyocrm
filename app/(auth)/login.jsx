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
  Alert,
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
  const { signIn } = useAuth();
  const { theme } = useTheme();
  const s = useMemo(() => mkStyles(theme), [theme]);
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      await signIn({
        email: values.email,
        password: values.password,
        remember,
      });
    } catch (error) {
      Alert.alert("Error", error.message || "Error al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mkStyles = (theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
      },
      scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
      },
      logoContainer: {
        alignItems: "center",
        marginBottom: theme.spacing.xxl,
      },
      logo: {
        width: 200,
        height: 80,
        resizeMode: "contain",
      },
      title: {
        fontSize: 24,
        fontWeight: "bold",
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
        textAlign: "center",
      },
      row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: theme.spacing.md,
      },
      rememberText: {
        color: theme.colors.text,
        marginLeft: theme.spacing.sm,
      },
      forgotPassword: {
        color: theme.colors.primary,
        fontWeight: "500",
      },
      button: {
        marginTop: theme.spacing.lg,
      },
      signupContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: theme.spacing.xl,
      },
      signupText: {
        color: theme.colors.text,
      },
      signupLink: {
        color: theme.colors.primary,
        fontWeight: "bold",
        marginLeft: 4,
      },
    });

  return (
    <SafeAreaView style={s.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.logoContainer}>
            <Image source={LOGO} style={s.logo} />
          </View>

          <Text style={s.title}>Iniciar sesión</Text>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={schema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <>
                <TextField
                  label="Correo electrónico"
                  placeholder="tucorreo@ejemplo.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  error={touched.email && errors.email}
                  autoCorrect={false}
                />

                <TextField
                  label="Contraseña"
                  placeholder="•••••••"
                  secureTextEntry
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  error={touched.password && errors.password}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="go"
                />

                <View style={s.row}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Switch
                      value={remember}
                      onValueChange={setRemember}
                      trackColor={{ false: "#E5E7EB", true: "#0F4C4A" }}
                    />
                    <Text style={s.rememberText}>Recordarme</Text>
                  </View>

                  <Text
                    style={s.forgotPassword}
                    onPress={() => router.push("/(auth)/forgot-password")}
                  >
                    ¿Olvidaste tu contraseña?
                  </Text>
                </View>

                <Button
                  title={isSubmitting ? "Entrando..." : "INICIAR SESIÓN"}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  style={s.button}
                />
              </>
            )}
          </Formik>

          <View style={s.signupContainer}>
            <Text style={s.signupText}>¿No tienes una cuenta?</Text>
            <Text
              style={s.signupLink}
              onPress={() => router.push("/(auth)/register")}
            >
              Regístrate
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
