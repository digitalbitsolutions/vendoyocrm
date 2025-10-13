import { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    ImageBackground,
    Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Formik } from "formik";
import * as Yup from "yup";

import { useRouter } from "expo-router";

import { theme } from "../../src/style/theme";
import { TextField } from "../../src/components/TextField";
import { Button } from "../../src/components/Button";
import { InlineMessage } from "../../src/components/InlineMessage";
import { sendPasswordReset } from "../../src/services/auth";

const BG = require("../../assets/images/Hero/background.png");

const COOLDOWN_SECOND = 30;

// Validación del form (solo email)
const schema = Yup.object({
    email: Yup.string().email("Email no válido").required("El e-mail es obligatorio"),
});

export default function Forget() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [sent, setSent] = useState(false);
    const [emailSentTo, setEmailSentTo] = useState("");

    // Cooldown evita spam de envio
    const [cooldown, setCooldown] = useState(0);

    // Temporizador para el cooldown (1s a la vez)
    useEffect(() => {
        if (!cooldown) return;
        const t = setInterval(() => setCooldown((s) => Math.max(0, s-1)), 1000);
        return () => clearInterval(t);
    }, [cooldown]);



    return (
        <ImageBackground source={BG} style={s.bg} resizeMode="cover">
            <View style={s.scrim} pointerEvents="none"/>

            <SafeAreaView style={[s.bg, { position: "relative", zIndex: 2}]} edges={["top", "bottom"]}>
                <KeyboardAwareScrollView
                    contentContainerStyle={[
                        s.scroll,
                        {
                            flexGrow: 1,
                            justifyContent: "center",
                            paddingTop: insets.top + theme.spacing.lg,
                            paddingBottom: insets.bottom + theme.spacing.xl,
                        },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    enableOnAndroid={true}
                    extraScrollHeight={24}
                    keyboardDismissMode="on-drag"
                >
                    {/* Capa exterior con sombra */}
                    <View style={s.cardShadow}>
                        {/* Capa interior que recorta esquinas */}
                        <View style={s.card}>
                            {/* Header */}
                            <View style={s.header}>
                                <Text style={s.title}>¿Olvidaste tu contraseña?</Text>
                                <Text style={s.subtitle}>
                                    Escribe tu e-mail y te enciaremos un enlace para restablecerla
                                </Text>
                            </View>

                            {/* mensaje de éxito si ya "enviamos" */}
                            {sent && (
                                <InlineMessage type="success" style={{ marginBottom: theme.spacing.md }}>
                                    <Text>
                                        Te enviamos un enlace a <Text style={{ fontWeight: "700" }}>{emailSentTo}</Text>.
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
                                        await sendPasswordReset (values.email);
                                        setEmailSentTo(values.email);
                                        setSent(true);
                                        setCooldown(COOLDOWN_SECOND);
                                        helpers.setSubmitting(false);
                                    } catch (e) {
                                        helpers.setSubmitting(false);
                                        helpers.setFieldError("email", e.message || "No pudimos enviar el correo. Inténtalo más tarde.");
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
                                        />

                                        <View style={s.links}>
                                            <Text
                                                style={s.link}
                                                onPress={() => router.push("/login")}
                                                accessibilityRole="button"
                                                accessibilityLabel="Volver al inicio de sesión"
                                                testID="forget-back-to-login"
                                            >
                                                Volver al inicio de sesión
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

const s = StyleSheet.create({
    bg: { flex: 1 },
    scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.5)", zIndex: 1, },
    scroll: { paddingHorizontal: theme.spacing.lg },

    // Sombra fuera + recorte dentro
    cardShadow: {
        width: "100%",
        maxWidth: 420,
        borderRadius: theme.radius.xl,
        alignSelf: "center",
        backgroundColor: theme.colors.surface,
        ...theme.shadow,
    },

    card: {
        borderRadius: theme.radius.xl,
        overflow: "hidden",
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.xl,
    },

    header: { alignItems: "center", marginBottom: theme.spacing.md },
    title: { color: theme.colors.text, fontSize: theme.font.h2, fontWeight: "800", textAlign: "center" },
    subtitle: {
        marginTop: 6,
        fontSize: theme.font.small,
        color: theme.colors.textMuted,
        textAlign: "center",
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