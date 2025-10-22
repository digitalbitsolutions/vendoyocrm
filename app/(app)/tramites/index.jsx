// --------------------------------------------------------------------------------------
// Pantalla: Mis Trámites
// - AppBar variante "section": flecha atrás + título a la izquierda
// - Barra de acciones: filtros por estado + búsqueda + botón "Nuevo Trámite"
// - Lista de cards: título, metadatos, estado (chip), adjuntos y acciones (Editar/Eliminar)
// - TODO (próximo paso): conectar con backend real
// --------------------------------------------------------------------------------------

import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import AppBar from "../../../src/components/AppBar";
import { theme } from "../../../src/style/theme";
import { useRouter } from "expo-router";

// --------------------------------------------------------------------------------------
// Datos MOCK para probar layout (luego los cambiamos por tu fetch real)
// --------------------------------------------------------------------------------------
const MOCK_TRAMITES = [
    {
        id: "t1",
        titulo: "Compraventa Inmueble - Calle Mallorca 128",
        ref: "CV-2025-0037",
        cliente: "Miguel, Yesan",
        fechaInicio: "2025-06-23",
        fechaFinEstimada: "2025-07-03",
        descripcion: "Gestión completa de la compraventa de vivienda. Incluye verificación registral, contrato, firma notarial y registro.",
        estado: "pendiente",   // "pendiente" | "proceso" | "completado"
        adjuntos: [{ tipo: "img", nombre: "escritura.jpg" }],
    },
    {
        id: "t2",
        titulo: "Trámite de Compra-Venta Inmobiliaria",
        ref: "CV-2025-0036",
        cliente: "Miguel, Yesan",
        fechaInicio: "2025-06-23",
        fechaFinEstimada: "2025-07-06",
        descripcion: "Proceso administrativo para formalizar la transferencia legal de una propiedad. Incluye validación documental.",
        estado: "proceso",
        adjuntos: [{ tipo: "pdf", nombre: "contrato.pdf" }],
    },
    {
        id: "t3",
        titulo: "Regularización de Escrituras",
        ref: "REG-2025-0011",
        cliente: "Yesan, Miguel",
        fechaInicio: "2025-05-12",
        fechaFinEstimada: "2025-06-15",
        descripcion: "Ajuste de documentación y registro en entidad competente.",
        estado: "completado",
        adjuntos: [],
    },
];

// --------------------------------------------------------------------------------------
// Componentes pequeños reutilizables: Card, Chip de estado, Botoón de acción, Adjuntos.
// --------------------------------------------------------------------------------------

// Card simple con sombra redondeada
function Card({ children, style, onPress }) {
    const Comp = onPress ? TouchableOpacity : View;
    const pressProps = onPress
        ? { onPress, activeOpacity: 0.7, accessibilityRole: "button" }
        : {};
    return (
        <Comp style={[styles.card, style]} {...pressProps}>
            {children}
        </Comp>
    );
}

function Meta({ label, value }) {
    if (!value) return null;
    return (
        <View style= {styles.metaRow}>
            <Text style={styles.metaLabel}>{label}:</Text>
            <Text style={styles.metaValue}>{value || "-"}</Text>
        </View>
    );
}

// Chip de estado: colores sutiles usando tu theme
function StatusChip({ estado }) {
    // Map de estilos por estado
    const conf = {
        pendiente: {
            bg: "rgba(255,176,32,0.15)",
            fg: theme.colors.warning,
            label: "Pendiente",
        },
        proceso: {
            bg: "rgba(0,102,204,0.15)",
            fg: theme.colors.secondary,
            label: "En Proceso",
        },
        completado: {
            bg: "rgba(46,125,50,0.15)",
            fg: theme.colors.success,
            label: "Completado",
        },
    }[estado] || {
        bg: "rgba(0,0,0,0.06)",
        fg: theme.colors.textMuted,
        label: "-",
    };

    return (
        <View style={[styles.chip, { backgroundColor: conf.bg }]}>
            <Text style={[styles.chipText, { color: conf.fg }]}>{conf.label}</Text>
        </View>
    );
}

// Botón de acción pequeño (Editar / Eliminar)
function SmallAction({ icon, label, color = theme.colors.text, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.smallBtn,
                pressed && { opacity: theme.opacity.pressed },
            ]}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <Ionicons name={icon} size={16} color={color} />
            <Text style={[styles.smallBtnText, { color }]}>{label}</Text>
        </Pressable>
    );
}

// Badge de adjunto (IMG/PDF)
function AttachmentBadge({ tipo = "file", nombre = "" }) {
    const map = {
        img: { label: "IMG", bg: "#8B5CF6" },
        pdf: { label: "PDF", bg: "#EF4444" },
        file: { label: "FILE", bg: "#6B7280" },
    };
    const c = map[tipo] || map.file;
    return (
        <View style={styles.attach}>
            <View style={[styles.attachIcon, { backgroundColor: c.bg}]}>
                <Text style={styles.attachIconText}>{c.label}</Text>
            </View>
            <Text style={styles.attachName} numberOfLines={1}>
                {nombre || "Ver"}
            </Text>
        </View>
    );
}

// --------------------------------------------------------------------------------------
// Tarjeta de Trámite (una fila de la lista)
// --------------------------------------------------------------------------------------
function TramiteCard({ item, onEditar, onEliminar }) {
    return (
        <Card style={{ padding: theme.spacing.lg }}>
            {/* Título / Ref */}
            <Text style={styles.title}>{item.titulo}</Text>

            <View style={{ height: 8 }} />

            {/* Metadatos */}
            <Meta label="Ref" value={item.ref} />
            <Meta label="Cliente" value={item.cliente} />
            <Meta label="Fecha Inicio" value={item.fechaInicio} />
            <Meta label="Fecha Fin Estimada" value={item.fechaFinEstimada} />

            <View style={{ height: 8}} />

            {/* Descripción */}
            <Text style={styles.metaLabel}>Descripción</Text>
            <Text style={styles.metaValue}>{item.descripcion}</Text>

            {/* Adjuntos (si hay) */}
            <View style={styles.attachBox}>
                <Text style={styles.attachTitle}>Archivos Adjuntos:</Text>
                <View style={styles.attachRow}>
                    {item.adjuntos?.length
                        ? item.adjuntos.map((a, idx) => (
                            <AttachmentBadge key={idx} tipo={a.tipo} nombre="Ver" />
                        ))
                        : <Text style={styles.attachEmpty}>No hay adjuntos</Text>}
                </View>
            </View>

            {/* Estado + acciones */}
            <View style={styles.footerRow}>
                <StatusChip estado={item.estado} />
                <View style={{ flexDirection: "row", gap: 12 }}>
                    <SmallAction
                        icon="create-outline"
                        label="Editar"
                        color={theme.colors.warning}
                        onPress={() => onEditar?.(item)}
                    />
                    <SmallAction
                        icon="trash-outline"
                        label="Eliminar"
                        color={theme.colors.primary}
                        onPress={() => onEliminar?.(item)}
                    />
                </View>
            </View>
        </Card>
    );
}

// --------------------------------------------------------------------------------------
// Pantalla principal
// --------------------------------------------------------------------------------------
export default function TramitesScreen() {
    const router= useRouter();

    // Estado UI: filtro por estado + búsqueda
    const [estado, setEstado] = useState("todos");
    const [q, setQ] = useState("");

    // Filtro básico en memoria
    const list = useMemo(() => {
        return MOCK_TRAMITES.filter((t) => {
            const okEstado = estado === "todos" ? true : t.estado === estado;
            const hayQ = q.trim().toLowerCase();
            const okTexto = !hayQ
                ? true
                : (t.titulo + t.ref + t.cliente + t.descripcion)
                    .toLowerCase()
                    .includes(hayQ);
            return okEstado && okTexto;
        });
    }, [estado, q]);
    
    // Acciones (mock)
    const nuevoTramite = () => {
        // cuando tengas pantalla de creación: touter.push("/(app)/tramites/nuevo");
        router.push("/(app)/tramites/nuevo");
    };
    const editar = (item) => alert(`Editar: ${item.ref} (TODO)`);
    const eliminar = (item) => alert(`Eliminar: ${item.ref} (TODO)`);

    return (
        <SafeAreaView style={styles.safe} edges={["top","left", "right", "bottom"]}>
            {/* AppBar variante sección: flecha + título a la izquierda */}
            <AppBar variant="section" title="Mis Trámites" />

            {/* Barra de acciones (filtros + búsqueda + CTA) */}
            <View style={styles.actions}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                >
                    <FilterChip label="Todos" active={estado === "todos"} onPress={() => setEstado("todos")} />
                    <FilterChip label="Pendiente" active={estado === "pendiente"} onPress={() => setEstado("pendiente")} />
                    <FilterChip label="En Proceso" active={estado === "proceso"} onPress={() => setEstado("proceso")} />
                    <FilterChip label="Completado" active={estado === "completado"} onPress={() => setEstado("completado")} />

                </ScrollView>

                {/* Buscador */}
                <View style={styles.searchWrap}>
                    <Ionicons name="search" size={18} color={theme.colors.textMuted} />
                    <TextInput
                        value={q}
                        onChangeText={setQ}
                        placeholder="Buscar por título, ref, cliente..."
                        placeholderTextColor={theme.colors.textMuted}
                        style={styles.searchInput}
                    />
                </View>

                {/* CTA: Nuevo Trámite */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={nuevoTramite}
                    style={styles.cta}
                >
                    <Ionicons name="add-circle" size={18} color={theme.colors.onSecondary} />
                    <Text style={styles.ctaText}>Nuevo Trámite</Text>
                </TouchableOpacity>
            </View>

            {/* Lista */}
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {list.length ? (
                    list.map((t) => (
                        <TramiteCard key={t.id} item={t} onEditar={editar} onEliminar={eliminar} />
                    ))
                ) : (
                    <Card style={{ alignItems: "center", padding: theme.spacing.xl }}>
                        <Ionicons name="documents-outline" size={32} color={theme.colors.textMuted} />
                        <Text style={styles.emptyTitle}>No hay trámites</Text>
                        <Text style={styles.emptyText}>
                            Crea tu primer trámite con el botón "Nuevo Trámite".
                        </Text>
                    </Card>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// Chip de filtro (barra superior)
function FilterChip({ label, active, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.fchip,
                active && styles.fchipActive,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: !!active }}
        >
            <Text style={[styles.fchipText, active && styles.fchipTextActive]}>
                {label}
            </Text>
        </Pressable>
    );
}

// --------------------------------------------------------------------------------------
// Estilos
// --------------------------------------------------------------------------------------
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
  
    // Scroll de contenido
    scroll: {
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
  
    // Card base
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      ...theme.shadow,
    },
  
    // Título de cada trámite
    title: {
      fontSize: theme.font.h2,
      fontWeight: "800",
      color: theme.colors.text,
      lineHeight: theme.font.h2 + 6,
    },
  
    // Metadatos
    metaLabel: {
      color: theme.colors.text,
      fontSize: theme.font.small,
      fontWeight: "800",
    },
    metaValue: {
      color: theme.colors.textMuted,
      fontSize: theme.font.body,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 6,
        marginBottom: 2,
    },
  
    // Caja adjuntos
    attachBox: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: "#F9FAFB",
    },
    attachTitle: {
      fontSize: theme.font.h3,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 10,
    },
    attachRow: { flexDirection: "row", gap: 12, alignItems: "center" },
    attachEmpty: { color: theme.colors.textMuted },
  
    // Badge de adjunto
    attach: { alignItems: "center" },
    attachIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      ...theme.shadow,
    },
    attachIconText: { color: "#fff", fontWeight: "900", fontSize: 14 },
    attachName: { marginTop: 6, color: theme.colors.textMuted, fontSize: theme.font.tiny },
  
    // Footer card
    footerRow: {
      marginTop: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
  
    // Chip de estado
    chip: {
      borderRadius: theme.radius.pill,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    chipText: {
      fontSize: theme.font.small,
      fontWeight: "800",
    },
  
    // Botones de acción
    smallBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: theme.radius.pill,
      backgroundColor: "rgba(0,0,0,0.03)",
    },
    smallBtnText: {
      fontSize: theme.font.small,
      fontWeight: "800",
    },
  
    // Barra de acciones (filtros + búsqueda + CTA)
    actions: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
  
    // Chips de filtro
    fchip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: theme.radius.pill,
      backgroundColor: "rgba(0,0,0,0.04)",
    },
    fchipActive: {
      backgroundColor: theme.colors.secondary,
    },
    fchipText: {
      fontWeight: "700",
      color: theme.colors.text,
      fontSize: theme.font.small,
    },
    fchipTextActive: {
      color: theme.colors.onSecondary,
    },
  
    // Buscador
    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      height: 44,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
    },
    searchInput: {
      flex: 1,
      color: theme.colors.text,
      fontSize: theme.font.body,
    },
  
    // CTA
    cta: {
      height: 48,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    ctaText: {
      color: theme.colors.onSecondary,
      fontWeight: "800",
      fontSize: theme.font.body,
    },
  
    // Empty-state
    emptyTitle: {
      marginTop: 8,
      fontSize: theme.font.h3,
      fontWeight: "800",
      color: theme.colors.text,
    },
    emptyText: {
      color: theme.colors.textMuted,
      marginTop: 4,
    },
  });