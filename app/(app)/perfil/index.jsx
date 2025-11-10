import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  ActionSheetIOS
} from "react-native";
import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
  launchCameraAsync,
  requestCameraPermissionsAsync,
  MediaTypeOptions
} from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import AppBar from "../../../src/components/AppBar";
import { useTheme } from "../../../src/style/theme";
import { Button } from "../../../src/components/Button";

import { getProfile, updateProfile } from "../../../src/services/profile";
import { uploadImage } from "../../../src/services/uploads";

export default function PerfilScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const s = mkStyles(theme);

  // ---------- Estado principal ----------
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ---------- Cargar perfil ----------
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const p = await getProfile();
      setProfile(p);
    } catch (e) {
      Alert.alert("Error", e?.message || "No se pudo cargar el perfil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const p = await getProfile();
      setProfile(p);
    } catch (e) {
      Alert.alert("Error", e?.message || "No se pudo actualizar.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ---------- Helpers de avatar ----------
  const handlePicked = useCallback(async (asset) => {
    try {
      if (!asset?.uri) return;
      setUploading(true);
      // sube (en mock devuelve la misma uri)
      const up = await uploadImage(
        { uri: asset.uri, name: asset.fileName, type: asset.mimeType },
        { folder: "avatars" }
      );
      // guarda en perfil
      const updated = await updateProfile({ avatarUrl: up.url });
      setProfile(updated);
    } catch (e) {
      Alert.alert("Error", e?.message || "No se pudo actualizar el avatar.");
    } finally {
      setUploading(false);
    }
  }, []);

  const openLibrary = useCallback(async () => {
    const perm = await requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería.");
      return;
    }
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9
    });
    if (result.canceled) return;
    await handlePicked(result.assets?.[0]);
  }, [handlePicked]);

  const openCamera = useCallback(async () => {
    const perm = await requestCameraPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permiso requerido", "Activa el permiso de cámara para continuar.");
      return;
    }
    const result = await launchCameraAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9
    });
    if (result.canceled) return;
    await handlePicked(result.assets?.[0]);
  }, [handlePicked]);

  const removeAvatar = useCallback(async () => {
    try {
      setUploading(true);
      const updated = await updateProfile({ avatarUrl: null });
      setProfile(updated);
    } catch (e) {
      Alert.alert("Error", e?.message || "No se pudo quitar la foto.");
    } finally {
      setUploading(false);
    }
  }, []);

  const chooseAvatar = useCallback(() => {
    const hasPhoto = !!profile?.avatarUrl;
    const run = async (key) => {
      if (key === "camera") return openCamera();
      if (key === "library") return openLibrary();
      if (key === "remove" && hasPhoto) return removeAvatar();
    };

    if (Platform.OS === "ios") {
      const options = ["Cancelar", "Tomar foto", "Elegir de galería", ...(hasPhoto ? ["Quitar foto"] : [])];
      const cancelButtonIndex = 0;
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex, userInterfaceStyle: "automatic" },
        (i) => {
          if (i === 1) run("camera");
          if (i === 2) run("library");
          if (hasPhoto && i === 3) run("remove");
        }
      );
    } else {
      Alert.alert("Foto de perfil", "Selecciona una opción", [
        { text: "Tomar foto", onPress: () => run("camera") },
        { text: "Elegir de galería", onPress: () => run("library") },
        ...(hasPhoto ? [{ text: "Quitar foto", style: "destructive", onPress: () => run("remove") }] : []),
        { text: "Cancelar", style: "cancel" }
      ]);
    }
  }, [profile?.avatarUrl, openCamera, openLibrary, removeAvatar]);

  // ---------- UI derivada ----------
  const initials = useMemo(() => {
    const name = profile?.name || "";
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p?.[0]?.toUpperCase() || "").join("") || "VY";
  }, [profile]);

  // ---------- Render ----------
  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <AppBar variant="section" title="Mi perfil" showBorder={false} />

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            tintColor={theme.colors.textMuted}
            colors={[theme.colors.secondary]}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* Card Perfil */}
        <View style={s.card}>
          {/* Header: Avatar + Nombre/Email */}
          <View style={s.headerRow}>
            <Pressable
              onPress={chooseAvatar}
              style={({ pressed }) => [s.avatarWrap, pressed && { opacity: theme.opacity.pressed }]}
              accessibilityRole="button"
              accessibilityLabel="Cambiar foto de perfil"
              accessibilityHint="Abre opciones para tomar foto, elegir de galería o quitar"
            >
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={s.avatar} />
              ) : (
                <View style={[s.avatar, s.avatarFallback]}>
                  <Text style={s.avatarInitials}>{initials}</Text>
                </View>
              )}

              {/* Overlay "editar" */}
              <View style={s.camBadge}>
                {uploading ? (
                  <ActivityIndicator size="small" color={theme.colors.onSecondary} />
                ) : (
                  <Ionicons name="camera" size={16} color={theme.colors.onSecondary} />
                )}
              </View>
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={s.name} numberOfLines={1}>
                {profile?.name || (loading ? "Cargando..." : "-")}
              </Text>
              <Text style={s.email} numberOfLines={1}>
                {profile?.email || "-"}
              </Text>

              <View style={s.badgeRow}>
                <Text style={[s.roleBadge, roleTone(profile?.role, s)]}>
                  {profile?.role ? String(profile.role || "").toUpperCase() : "USER"}
                </Text>
                {!!profile?.phone && <Text style={s.phone}>• {profile.phone}</Text>}
              </View>
            </View>
          </View>

          {/* Meta sencilla */}
          <View style={s.metaRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.textMuted} />
            <Text style={s.metaText}>
              Miembro desde{" "}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit"
                  })
                : "-"}
            </Text>
          </View>

          <View style={s.metaRow}>
            <Ionicons name="refresh-outline" size={16} color={theme.colors.textMuted} />
            <Text style={s.metaText}>
              Última actualización{" "}
              {profile?.updatedAt
                ? new Date(profile.updatedAt).toLocaleString("es-ES", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                : "-"}
            </Text>
          </View>

          {/* Acciones principales */}
          <View style={s.actionsRow}>
            <Button
              title="Editar perfil"
              onPress={() => router.push("/(app)/perfil/editar")}
              leftIcon={<Ionicons name="create-outline" size={18} color={theme.colors.onAccent} />}
              variant="primary"
              fullWidth
            />
            <Button
              title="Cambiar contraseña"
              onPress={() => router.push("/(app)/perfil/seguridad")}
              leftIcon={<Ionicons name="key-outline" size={18} color={theme.colors.text} />}
              variant="outline"
              fullWidth
            />
          </View>
        </View>

        {/* Estado de carga (primera vez) */}
        {loading && (
          <View style={s.loadingCard}>
            <ActivityIndicator size="small" color={theme.colors.secondary} />
            <Text style={s.loadingText}>Cargando perfil...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Helpers UI ----------*/
function roleTone(role, s) {
  if (!role) return s.roleUser;
  const r = String(role).toLowerCase();
  if (r.includes("admin")) return s.roleAdmin;
  if (r.includes("manager")) return s.roleManager;
  return s.roleUser;
}

/* ---------- Estilos ---------- */
const mkStyles = (theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { padding: theme.spacing.lg, gap: theme.spacing.lg },

    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      ...theme.shadow
    },

    headerRow: { flexDirection: "row", gap: theme.spacing.lg, alignItems: "center" },

    avatarWrap: { width: 84, height: 84 },
    avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: theme.colors.border },
    avatarFallback: { alignItems: "center", justifyContent: "center" },
    avatarInitials: { fontSize: 28, fontWeight: "800", color: theme.colors.textMuted },

    camBadge: {
      position: "absolute",
      right: -2,
      bottom: -2,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: theme.colors.surface
    },

    name: { fontSize: theme.font.h2, fontWeight: "800", color: theme.colors.text },
    email: { color: theme.colors.textMuted, marginTop: 2 },

    badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
    roleBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: theme.radius.pill,
      fontSize: theme.font.tiny,
      fontWeight: "900",
      overflow: "hidden"
    },
    roleAdmin: { backgroundColor: "rgba(255, 99, 132, .16)", color: "#ff5480" },
    roleManager: { backgroundColor: "rgba(76, 163, 255, .16)", color: theme.colors.secondary },
    roleUser: { backgroundColor: "rgba(0,0,0,.06)", color: theme.colors.textMuted },
    phone: { color: theme.colors.textMuted },

    metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
    metaText: { color: theme.colors.textMuted },

    actionsRow: { marginTop: theme.spacing.lg, gap: 10 },

    loadingCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface
    },
    loadingText: { color: theme.colors.textMuted }
  });
