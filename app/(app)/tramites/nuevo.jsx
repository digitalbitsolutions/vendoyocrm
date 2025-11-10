import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    DeviceEventEmitter,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { theme } from "../../../src/style/theme";

// Hace que esta pantalla se vea como MODAL (desliza desde abajo)
export const options = {
    presentation: "modal",
    headerShown: false,
    animation: "slide_from_bottom",
};

export default function NuevoTramiteScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Estado del formulario
    const [titulo, setTitulo] = useState("");
    const [ref, setRef] = useState("");
    const [cliente, setCliente] = useState("");
    const [fechaFin, setFechaFin] = useState("");           // dd/mm/aaaa (sin dependencias)
    const [estado, setEstado] = useState("pendiente");     // pendiente | proceso | completado
    const [descripcion, setDescripcion] = useState("");
    const [filesCount] = useState(0);                     // placeholder, sin picker de archivos

    // Validación mínima
    const canSave = useMemo(() => {
        return titulo.trim() && ref.trim() && cliente.trim();
    }, [titulo, ref, cliente]);

    const onClose = () => router.back();

    const toISO = (d) => {
        const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d?.trim() || "");
        if (!m) return null;
        const [_, dd, mm, yyyy] = m;
        return `${yyyy}-${mm}-${dd}`;
    }

    const onSubmit = () => {
        if (!canSave) return;
        const refNorm = ref.trim().toUpperCase();
        // Aquí llamarías a tu API/servicio. Por ahora solo simulamos:
        // await api.tramites.create({ titulo, ref, cliente, fechaFin, estado, descripcion, files })
        const payload = { 
            id: `t-${Date.now()}`,
            titulo: titulo.trim(),
            ref: refNorm,
            cliente: cliente.trim(),
            fechaInicio: null,
            fechaFinEstimada: toISO(fechaFin),
            estado,
            descripcion: descripcion.trim() || "",
            adjuntos: [],
        };
        DeviceEventEmitter.emit("tramite:created", payload);
        router.back();
    };

    return (
        <SafeAreaView style={[
            s.backdrop,
            { backgroundColor: theme.colors?.overlay || "rgba(0,0,0,0.4)" },
            ]}
            edges={["top", "bottom"]}
        >
            {/* Card central */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <View style={s.card}>
                    {/* header: título + X */}
                    <View style={s.header}>
                        <Text style={s.title}>Nuevo Trámite</Text>
                        <Pressable
                            onPress={onClose}
                            hitSlop={theme.hitSlop}
                            style={s.closeBtn}
                            accessibilityRole="button"
                            accessibilityLabel="Cerrar"
                        >
                            <Ionicons name="close" size={22} color={theme.colors.text} />
                        </Pressable>
                    </View>

                    {/* Contenido scrollable */}
                    <ScrollView
                        contentContainerStyle={[
                            s.content,
                            { paddingBottom: (theme.spacing.xxl + 90) + insets.bottom + 20 }

                        ]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Nombre */}
                        <Label>Nombre del Trámite: *</Label>
                        <Input
                            value={titulo}
                            onChangeText={setTitulo}
                            placeholder="Ej: Compraventa Inmuebles"
                        />

                        {/* Ref */}
                        <Label>Referencia: *</Label>
                        <Input
                            value={ref}
                            onChangeText={setRef}
                            placeholder="Ej: CV-2025-0037"
                            returnKeyType="next"
                            autoCapitalize="characters"
                        />

                        {/* Cliente */}
                        <Label>Cliente: *</Label>
                        <Input
                            value={cliente}
                            onChangeText={setCliente}
                            placeholder="Ej: Miguel Yesan"
                            returnKeyType="next"
                            autoCapitalize="words"
                        />

                        {/* Fecha Fin Estimada */}
                        <Label>Fecha Fin Estimada:</Label>
                        <Input
                            value={fechaFin}
                            onChangeText={setFechaFin}
                            placeholder="dd/mm/aaaa"
                            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                        />

                        {/* Estado (chips) */}
                        <Label>Estado: *</Label>
                        <View style={s.chipsRow}>
                            <Chip
                                label="Pendiente"
                                active={estado === "pendiente"}
                                onPress={() => setEstado("pendiente")}
                            />
                            <Chip
                                label="En Proceso"
                                active={estado === "proceso"}
                                onPress={() => setEstado("proceso")}
                            />
                            <Chip
                                label="Completado"
                                active={estado === "completado"}
                                onPress={() => setEstado("completado")}
                            />
                        </View>
                        
                        {/* Documentos (placeholder sin dependencias) */}
                        <Label>Documentos</Label>
                        <Pressable
                            onPress={() => alert("Adjuntar archivos (pendiente de integrar)")}
                            style={({ pressed }) => [
                                s.attachBtn,
                                pressed && { opacity: theme.opacity.pressed },
                            ]}
                            hitSlop={theme.hitSlop}
                            accessibilityRole="button"
                            accessibilityLabel="Adjuntar archivos"
                        >
                            <Ionicons name="attach" size={18} color={theme.colors.secondary} />
                            <Text style={s.attachText}>
                                {filesCount ? `${filesCount} archivo(s)` : "Adjuntar archivos"}
                            </Text>
                        </Pressable>

                        {/* Descripción */}
                        <Label>Descripción:</Label>
                        <Input
                            value={descripcion}
                            onChangeText={setDescripcion}
                            placeholder="Describe el trámite..."
                            multiline
                            numberOfLines={4}
                            style={{ height: 120, textAlignVertical: "top" }}
                        />
                    </ScrollView>

                    {/* Botón Guardar (barra fija + botón pill) */}
                    <View style={[s.saveBar, s.saveBarShadow, { paddingBottom: Math.max(insets.bottom, 8) }]}>
                    <Pressable
                        onPress={onSubmit}
                        disabled={!canSave}
                        style={({ pressed }) => [
                        s.saveCta,
                        pressed && { opacity: theme.opacity.pressed },
                        !canSave && { opacity: theme.opacity.disabled },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Guardar Trámite"
                        accessibilityState={{ disabled: !canSave }}
                        hitSlop={theme.hitSlop}
                    >
                        <Ionicons name="checkmark-circle" size={18} color={theme.colors.onSecondary} />
                        <Text style={s.saveCtaText}>Guardar Trámite</Text>
                    </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

/* ---------- UI helpers (Label, Input, Chip) ---------- */

function Label({ children }) {
    return <Text style={s.label}>{children}</Text>;
}

function Input(props) {
    return (
        <TextInput
            placeholderTextColor={theme.colors.textMuted}
            {...props}
            style={[s.input, props.style]}
        />
    );
}

function Chip({ label, active, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                s.chip,
                active && s.chipActive,
                pressed && !active && { opacity: theme.opacity.pressed },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: !!active }}
        >
            <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
        </Pressable>
    );
}

/* ---------- styles ---------- */

const s = StyleSheet.create({
    backdrop: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end",
    },
    card: {
        width: "100%",
        maxWidth: 720,
        alignSelf: "center",
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        ...theme.shadow,
        overflow: "hidden",
    },
    header: {
        height: 56,
        paddingHorizontal: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        fontSize: theme.font.h2,
        fontWeight: "800",
        color: theme.colors.text,
    },
    closeBtn: {
        height: 36,
        width: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        padding: theme.spacing.lg,
        gap: theme.spacing.sm,
    },
    label: {
        marginTop: theme.spacing.sm,
        marginBottom: 6,
        fontSize: theme.font.small,
        fontWeight: "800",
        color: theme.colors.text,
    },
    input: {
        height: 44,
        paddingHorizontal: 12,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        color: theme.colors.text,
        fontSize: theme.font.body,
    },
    chipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: theme.radius.pill,
        backgroundColor: "rgba(0,0,0,0.04)",
    },
    chipActive: {
        backgroundColor: theme.colors.secondary,
    },
    chipText: {
        fontWeight: "700",
        color: theme.colors.text,
        fontSize: theme.font.small,
    },
    chipTextActive: {
        color: theme.colors.onSecondary,
    },
    attachBtn: {
        height: 44,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 12,
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },
    attachText: {
        fontSize: theme.font.body,
        color: theme.colors.secondary,
        fontWeight: "700",
    },
    saveBarShadow: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
        elevation: 3,
    },
    saveBar: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.surface,
        paddingTop: 10,
        paddingHorizontal: theme.spacing.lg,
    },
    saveCta: {
        height: 56,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.secondary,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    saveCtaText: {
    color: theme.colors.onSecondary,
    fontWeight: "900",
    fontSize: theme.font.h3,   // más grande que body
    },
});
