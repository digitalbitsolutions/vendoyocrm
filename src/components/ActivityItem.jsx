// src/components/ActivityItem.jsx
import React, { memo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../style/theme";

/**
 * ActivityItem
 * Props:
 *  - item: { id, type, title, metaDate, refLabel, beforeAfter }
 *  - isLast: boolean (oculta la línea del timeline cuando es el último)
 */
export default memo(function ActivityItem({ item, isLast = false }) {
  const { theme } = useTheme();
  const s = mkStyles(theme);

  const type = item?.type || "create";
  const iconName = type === "create" ? "time-outline" : "refresh-outline";
  const tint = type === "create" ? theme.colors.secondary : theme.colors.accent;

  // safe alpha (añadimos transparencia a la misma paleta)
  const tintBg = (tint || "#000").replace("#", "") + "22"; // "#RRGGBB22"

  // formato ligero de fecha (si prefieres un util externo, lo conectamos)
  const metaDate = item?.metaDate ? new Date(item.metaDate) : null;
  const metaText = metaDate
    ? metaDate.toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "";

  return (
    <View style={s.root} accessible accessibilityRole="article">
      <View style={s.leftCol}>
        <View
          style={[
            s.iconBox,
            { borderColor: tint, backgroundColor: `#${tintBg}` },
          ]}
        >
          <Ionicons name={iconName} size={16} color={tint} />
        </View>

        {/* timeline vertical — si es último lo ocultamos */}
        {!isLast && (
          <View
            style={[s.timeline, { backgroundColor: theme.colors.border }]}
          />
        )}
      </View>

      <View style={s.content}>
        <Text style={s.title} numberOfLines={4}>
          {item.title}
        </Text>

        {/* referencia / before-after */}
        {item.refLabel ? <Text style={s.refLabel}>{item.refLabel}</Text> : null}

        {item.beforeAfter && (
          <View style={s.diffWrap}>
            {Object.entries(item.beforeAfter).map(([k, v]) => (
              <View style={s.diffRow} key={k}>
                <Text style={s.diffKey}>{k}</Text>
                <Text style={s.diffVal}>{v}</Text>
              </View>
            ))}
          </View>
        )}

        {/* fecha */}
        <View style={s.metaRow}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={theme.colors.textMuted}
          />
          <Text style={s.metaText}>{metaText}</Text>
        </View>
      </View>
    </View>
  );
});

/* ---------- estilos dependientes del theme (no tocar fuera) ---------- */
const mkStyles = (theme) =>
  StyleSheet.create({
    root: {
      flexDirection: "row",
      paddingVertical: theme.spacing.md,
      // separador abajo — cada item maneja su propio margin
      marginBottom: theme.spacing.md,
      alignItems: "flex-start",
    },

    leftCol: {
      width: 48,
      alignItems: "center",
    },

    iconBox: {
      width: 34,
      height: 34,
      borderRadius: 10,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
    },

    timeline: {
      position: "absolute",
      left: 48 / 2 - 0.5, // centra con respecto al leftCol
      top: 34 + 6, // empieza justo debajo del icon
      bottom: 0,
      width: 1,
      opacity: 0.9,
    },

    content: {
      flex: 1,
      paddingRight: theme.spacing.md,
    },

    title: {
      color: theme.colors.text,
      fontSize: theme.font.h3,
      fontWeight: "700",
      lineHeight: 22,
      marginBottom: 8,
    },

    refLabel: {
      color: theme.colors.secondary,
      fontWeight: "800",
      marginBottom: 6,
    },

    diffWrap: {
      backgroundColor:
        theme.mode === "light"
          ? theme.colors.primary + "10"
          : theme.colors.primary + "12",
      borderRadius: theme.radius.md || 12,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
    },

    diffRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.xs ?? 6,
    },
    diffKey: {
      color: theme.colors.textMuted,
      fontWeight: "800",
      width: 110,
    },
    diffVal: {
      color: theme.colors.text,
      flex: 1,
      textAlign: "left",
    },

    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
    },
    metaText: {
      color: theme.colors.textMuted,
      marginLeft: 8,
      fontSize: theme.font.small,
    },
  });
