import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../style/theme";

/**
 * InlineMessage
 * Props:
 * - type: "success" | "error" | "warning" | "info"
 * - children: texto del mensaje
 * - style: estilos adicionales opcionales
 */

export function InlineMessage({ type = "info", children, style }) {
    // Paleta por tipo (color del icono/texto)
    const palette = {
        success: { color: theme.colors.success, icon: "checkmark-circle" },
        error:   { color: theme.colors.primary, icon: "close-circle" },
        warning: { color: theme.colors.warning, icon: "alert-circle" },
        info:    { color: theme.colors.secondary, icon: "information-circle" },
    };

    const c = palette[type] || palette.info;

    // Fondos suaves por tipo (sin tocar theme)
    const bgByType = {
        success:  "rgba(46,125,50,0.08)",
        error:    "rgba(255,51,51,0.08)",
        warning:  "rgba(255,176,32,0.10)",
        info:     "rgba(0,102,204,0.08)",
    };

    return (
        <View style={[StyleSheet.wrap, { backgroundColor: bgByType[type]}, style]}>
            <Ionicons name={c.icon} size={18} color={c.color} style={{ marginRight: 8 }} />
            <Text style={[StyleSheet.text, { color:theme.colors.text }]}>
                {children}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: theme.radius.md,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    text: {
        fontSize: 14,
    },
});