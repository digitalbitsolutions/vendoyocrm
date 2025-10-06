import { Pressable, Text, StyleSheet, Platform } from "react-native";
import { theme } from "../style/theme";

export function Button( { title, onPress, disabled, loading,variant = "primary" }) {

    const textColor =
        variant === "primary" ? theme.colors.onAccent :
        variant === "secondary" ? theme.colors.onSecondary :
        theme.colors.text;

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            android_ripple={{ borderless: false }}
            style={({ pressed }) => [
                styles.base,
                styles[variant],
                (disabled || loading) && styles.disabled,
                pressed && { opacity: theme.opacity.pressed },
            ]}
            hitSlop={theme.hitSlop}
            accessibilityRole="button"
            accessibilityState={{ disabled: disabled || loading }}
        >
            <Text style={[styles.text, { color: textColor }]}>
                {loading ? "Cargando..." : title}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        height: 52,
        borderRadius: theme.radius.pill,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: theme.spacing.lg,
        ...theme.shadow,
        ...(Platform.OS === "android" ? { overflow: "hidden"} : null),
    },
    primary: { backgroundColor: theme.colors.accent },
    secondary: { backgroundColor: theme.colors.secondary },
    disabled: { opacity: theme.opacity.disabled },
    text: {
        fontSize: theme.font.body,
        fontWeight: "700",
    },
});