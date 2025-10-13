import {
    
    View, Text, Image,        // componentes basicos de layout y texto/imagen
    Switch,                   // interruptor para "Aceptar términos"
    StyleSheet,
    ImageBackground,          // fondo con imagen a pantalla completa
    Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";   // navegación entre pantallas
import { Formik } from "formik";           // manejo de formularios
import * as Yup from "yup";                // validación de datos

// Scroll inteligente que evita el teclado
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Tu tema y componentes reutilizables

import { theme } from "../../src/style/theme";
import { TextField } from "../../src/components/TextField";
import { Button } from "../../src/components/Button";
import { useAuth } from "../../src/context/AuthContext";

// Imágenes (mismo fondo y logo que el login)
const BG = require("../../assets/images/Hero/background.png");
const LOGO = require("../../assets/images/login/logo.png");

// 1. ESQUEMA DE VALIDACIÓN (Yup):
//    Define reglas para cada campo del formulario
//    Si no se cumplen, Formik mostrará los mensajes en tus <TextField />
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

// 2. COMPONENTE DE PANTALLA:
export default function Register() {
    const router = useRouter();   // para navegar cuando el registro sea exitoso
    const { signUp, isLoading } = useAuth();
    if (isLoading) return null;

    // 3. UI de la pantalla:
    return (
        // Imagen de fondo a pantalla completa
        <ImageBackground source={BG} style={s.bg} resizeMode="cover">
            {/* Scrim: velo muy suave para dar contraste al card */}
            <View style={s.scrim} />

            {/* SafeArea para respetar notch/bordes superioes/inferiores */}
            <SafeAreaView style={s.bg} edges={["top", "bottom"]}>
                {/* Mueve el contenido cuando se abre el teclado (eniOS) */}
                <KeyboardAwareScrollView
                    contentContainerStyle={s.scroll}        
                    keyboardShouldPersistTaps="handled"
                    enableOnAndroid={true}   
                    extraScrollHeight={24}
                    keyboardDismissMode="on-drag"
                >
                        {/* Tarjeta balnca centrada con sombra y bordes redondeados */}
                    <View style={s.centerer}>
                        <View style={s.card}>
                            {/* Cabecera con logo y títulos */}
                            <View style={s.header}>
                                <Image source={LOGO} style={s.logo} resizeMode="contain" />
                                <Text style={s.title}>Crear cuenta</Text>
                                <Text style={s.subtitle}>
                                    Regístrate para comenzar a usar VendoYo.es
                                </Text>
                            </View>

                            {/* Formulario con Formik */}
                            <Formik
                                // Valores iniciales de cada campo del form
                                initialValues={{
                                    name: "",
                                    email: "",
                                    password: "",
                                    confirmPassword: "",
                                    acceptTerms: false,
                                }}
                                validationSchema={schema}   // reglas definidas arriba
                                // Qué pasa cuando pulsas el botón "CREAR CUENTA"
                                onSubmit={async (values, helpers) => {
                                    try {
                                        await signUp({
                                            name: values.name,
                                            email: values.email,
                                            password: values.password,
                                        });
                                        router.replace("/");
                                    } catch (e) {
                                        helpers.setSubmitting(false);
                                        helpers.setFieldError("email", e.message || "No se puede crear la cuenta");
                                    }
                                }}
                            >
                                {({
                                    handleChange,   // cambia el valor de un campo
                                    handleBlur,     // marca el campo como "tocado"
                                    handleSubmit,   // ejecuta onSubmit
                                    values,         // valores actuales del form
                                    errors,         // errores actuales según Yup
                                    touched,        // qué campos fueron tocados
                                    isSubmitting,   // true si el form está "enviando"
                                    setFieldValue,  // para cambiar valores manualmente (switch)
                                }) => (
                                    <>
                                        {/* Campo: Nombre */}
                                        <TextField
                                            label="Nombre completo"
                                            value={values.name}
                                            onChangeText={handleChange("name")}
                                            onBlur={handleBlur("name")}
                                            error={touched.name && errors.name}
                                            autoComplete="name"
                                            returnKeyType="next"   // Botón "siguiente" en teclado
                                        />

                                        {/* Campo: E-mail */}
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

                                        {/* Campo: Contraseña */}
                                        <TextField
                                            label="Contraseña"
                                            value={values.password}
                                            onChangeText={handleChange("password")}
                                            onBlur={handleBlur("password")}
                                            error={touched.password && errors.password}
                                            secureTextEntry        // oculta caracteres
                                            textContentType="password"
                                            autoComplete="off"
                                            importantForAutofill="no"
                                            returnKeyType="next"
                                            style={{ marginTop: theme.spacing.sm }}
                                        />

                                        {/* Campo: Confirmar contraseña */}
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
                                            onSubmitEditing={handleSubmit}   // enviar con "enter"
                                        />

                                        {/* Switch: Aceptar términos */}
                                        <View style={s.row}>
                                            <Switch
                                                value={values.acceptTerms}
                                                onValueChange={(v) => setFieldValue("acceptTerms", v)}
                                                trackColor={{ false: "#d1d5db", true: theme.colors.secondary }}
                                                thumbColor="#fff"
                                            />
                                            <Text style={s.rowText}>
                                                Acepto los términos y la Política de Privacidad
                                            </Text>
                                        </View>

                                        {/* Botón: CREAR CUENTA */}
                                        <Button
                                            title={isSubmitting ? "Creando cuenta.." : "CREAR CUENTA"}
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
                                            variant="primary"    // amarillo de tu tema
                                        />

                                        {/* Enlaces: volver al login */}
                                        <View style={s.links}>
                                            <Text style={s.link} onPress={() => router.push("/login")}>
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

// 5. ESTILOS
const s = StyleSheet.create({
    bg: { flex: 1 },   // BG ocupa todo el espacio
    // Capa semitransparente para mejorar contraste del card sobre el fondo
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
    },
    header: {
        alignItems: "center",
        marginBottom: theme.spacing.md,
    },
    logo: {
        width: 160,
        height: 160,
        marginBottom: theme.spacing.sm,
        ...theme.shadow
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