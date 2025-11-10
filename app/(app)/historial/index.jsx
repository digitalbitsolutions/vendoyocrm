import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppBar from "../../../src/components/AppBar";
import { useTheme } from "../../../src/style/theme";

/* ---------- Utils ---------- */
const formatDateTime = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
};

/* ---------- Mock ---------- */
const MOCK = [
  {
    id: "a1",
    type: "create",
    title: "Nuevo trámite 1 creado por Miguel Yesan.",
    metaDate: "2025-09-02T13:21:00Z",
  },
  {
    id: "a2",
    type: "create",
    title: "Nuevo trámite 1 creado por Miguel Yesan.",
    metaDate: "2025-09-02T13:21:00Z",
  },
  {
    id: "a3",
    type: "update",
    title:
      "José María Bardina actualizó los datos del trámite Trámite de Compra-Venta Inmobiliaria.",
    refLabel: "Referencia:",
    beforeAfter: {
      "Antes:": "Recomendado por Miguel",
      "Después:": "CV-2025-0036",
    },
    metaDate: "2025-06-23T10:46:00Z",
  },
  {
    id: "a4",
    type: "create",
    title:
      "Nuevo trámite Compraventa Inmueble - Calle Mallorca 128 creado por José María Bardina.",
    metaDate: "2025-06-23T10:45:00Z",
  },
  {
    id: "a5",
    type: "update",
    title:
      "José María Bardina actualizó los datos del trámite Trámite de Compra-Venta Inmobiliaria.",
    refLabel: "Fecha estimada de finalización:",
    beforeAfter: {
      "Antes:": "2025-07-05",
      "Después:": "2025-07-06",
    },
    metaDate: "2025-06-23T10:43:00Z",
  },
  {
    id: "a6",
    type: "create",
    title:
      "Nuevo trámite Trámite de Compra-Venta Inmobiliaria creado por José María Bardina.",
    metaDate: "2025-06-23T10:42:00Z",
  },
];

/* ---------- Pantalla ---------- */
export default function HistorialScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const s = mkStyles(theme);

  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(MOCK);
  }, []);

  const list = useMemo(() => items, [items]);

  /* ---------- Sub-componentes UI (dentro para usar theme) ---------- */

  function SectionCard({ title, children, style }) {
    return (
      <View style={[s.card, style]}>
        {!!title && <Text style={s.cardTitle}>{title}</Text>}
        {children}
      </View>
    );
  }

  function Divider() {
    return <View style={s.divider} />;
  }

  function MetaDate({ iso }) {
    return (
      <View style={s.metaRow}>
        <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
        <Text style={s.metaText}>{formatDateTime(iso)}</Text>
      </View>
    );
  }

  function DiffTable({ label, beforeAfter }) {
    if (!beforeAfter) return null;
    const entries = Object.entries(beforeAfter);
    return (
      <View style={s.diffWrap}>
        {!!label && <Text style={s.diffLabel}>{label}</Text>}
        <View style={s.diffGrid}>
          {entries.map(([k, v]) => (
            <View key={k} style={s.diffRow}>
              <Text style={s.diffKey}>{k}</Text>
              <Text style={s.diffVal}>{v}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  function ActivityItem({ item, isLast }) {
    const t = item.type || "create";
    const iconName = t === "create" ? "time-outline" : "refresh-outline";
    const tint = t === "create" ? theme.colors.secondary : theme.colors.accent;

    return (
      <View style={s.item}>
        {/* Línea del timeline */}
        <View pointerEvents="none" style={[s.timeline, isLast && { opacity: 0 }]} />

        {/* Icono a la izquierda */}
        <View style={[s.iconBox, { borderColor: tint }]}>
          <Ionicons name={iconName} size={16} color={tint} />
        </View>

        {/* Contenido */}
        <View style={{ flex: 1 }}>
          <Text style={s.itemTitle}>{item.title}</Text>
          {item.refLabel ? <Text style={s.refLink}>{item.refLabel}</Text> : null}
          <DiffTable label={null} beforeAfter={item.beforeAfter} />
          <MetaDate iso={item.metaDate} />
          <Divider />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <AppBar variant="section" title="Historial de Actividad" showBorder={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.sm,       // margen superior afinado (pegado al AppBar sin “chocar”)
          paddingBottom: Math.max(insets.bottom, theme.spacing.xl),
          gap: theme.spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard title="Últimas Acciones" style={{ paddingTop: theme.spacing.sm, marginTop: theme.spacing.sm }}>
          {list.map((it, idx) => (
            <ActivityItem key={it.id} item={it} isLast={idx === list.length - 1} />
          ))}
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Estilos dependientes del tema ---------- */
const mkStyles = (theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },

    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      ...theme.shadow,
    },
    cardTitle: {
      fontSize: theme.font.h2,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },

    item: {
      flexDirection: "row",
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      position: "relative",
    },

    timeline: {
      position: "absolute",
      left: 14,
      top: 0,
      bottom: 0,
      width: 1,
      backgroundColor: theme.colors.border,
    },
    iconBox: {
      width: 28,
      height: 28,
      borderRadius: theme.radius.sm,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
      backgroundColor: theme.colors.surface,
    },
    itemTitle: {
      color: theme.colors.text,
      fontSize: theme.font.body,
      lineHeight: 22,
      fontWeight: "600",
      marginBottom: 6,
    },

    refLink: {
      color: theme.colors.secondary,
      fontWeight: "800",
      marginBottom: 6,
    },

    diffWrap: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.sm,
    },
    diffLabel: {
      color: theme.colors.secondary,
      fontWeight: "800",
      marginBottom: theme.spacing.sm,
    },
    diffGrid: { gap: 6 },
    diffRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: theme.spacing.lg,
    },
    diffKey: {
      color: theme.colors.textMuted,
      fontWeight: "800",
      width: 110,
    },
    diffVal: { color: theme.colors.text, flex: 1 },

    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 2,
    },
    metaText: { color: theme.colors.textMuted, fontSize: theme.font.small },

    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginTop: theme.spacing.md,
      marginLeft: 44,
    },
  });
