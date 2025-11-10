import React from "react";
import { View, Text, Image, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../style/theme";

const LOGO = require("../../../assets/images/dashboard/logo-dashboard.webp");

export default function AppBar ({
    variant = "dashboard",
    title= "",
    onBack,
    onBackPress,             // <-- agregado (sin romper onBack)
    style,
    showBorder = true,
}) {
    const router = useRouter();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const s = mkStyles(theme);

    const openDrawer = () => {
        if (navigation?.openDrawer) {
            navigation.openDrawer();
        }
    };

    const handleBack = () => {
        if (typeof onBackPress === "function") return onBackPress(); // <-- agregado
        if (typeof onBack === "function") return onBack();
        router.replace("/(app)/dashboard");
    };

    if (variant === "section") {
        return (
            <View style={[s.wrap, !showBorder && { borderBottomWidth: 0 },style]}>
                <Pressable
                    onPress={handleBack}
                    hitSlop={theme.hitSlop}
                    accessibilityRole="button"
                    style={s.left}
                >
                    <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
                    <Text numberOfLines={1} style={s.titleSection}>{title}</Text>
                </Pressable>
                <View style={{ width: 24 }} />
            </View>
        );
    }

    return (
        <View style={[s.wrap, style]}>
            <View style={s.left}>
                <Image
                    source={LOGO}
                    style={{ width: 140, height: 28 }}
                    resizeMode="contain"
                    accessibilityLabel="VendoYo"
                />
            </View>

            <Pressable
                onPress={openDrawer}
                hitSlop={theme.hitSlop}
                accessibilityRole="button"
                style={s.rightBtn}
            >
                <Ionicons name="menu" size={24} color={theme.colors.text} />
            </Pressable>
        </View>
    );
}

const mkStyles = (theme) =>
    StyleSheet.create({
    wrap: {
        height: 56,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        ...theme.shadow,
        ...(Platform.OS === "android" ? { elevation: 4 } : null),
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flexShrink: 1,
    },
    rightBtn: {
        height: 40,
        width: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
    },
    titleSection: {
        fontSize: theme.font.h3,
        fontWeight: "700",
        color: theme.colors.text,
        maxWidth: 240,
    },
});
