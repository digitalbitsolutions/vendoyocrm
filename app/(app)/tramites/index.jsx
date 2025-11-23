// app/(app)/tramites/index.jsx
import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  DeviceEventEmitter,
  Platform,
  Keyboard,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AppBar from "../../../src/components/AppBar";
import { useTheme } from "../../../src/style/theme";

/* ------------------------------------
   MOCK inicial (sustituir por API luego)
   ------------------------------------ */
const MOCK_TRAMITES = [
  {
    id: "t1",
    titulo: "Compraventa Inmueble - Calle Mallorca 128",
    ref: "CV-2025-0036",
    cliente: "Miguel, Yesan",
    estado: "Pendiente",
    creadoEl: "2025-06-23",
  },
  {
    id: "t2",
    titulo: "Trámite de Compra-Venta Inmobiliaria",
    ref: "CV-2025-0037",
    cliente: "María López",
    estado: "En Proceso",
    creadoEl: "2025-06-24",
  },
  {
    id: "t3",
    titulo: "Alquiler – C/ Aragó 220, 3-1",
    ref: "ALQ-2025-0142",
    cliente: "José María Bardina",
    estado: "Completado",
    creadoEl: "2025-06-25",
  },
];

/* -------------------------
   Pequeños componentes memo
   ------------------------- */
const FilterChip = React.memo(function FilterChip({
  label,
  active,
  onPress,
  s,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, active && s.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </Pressable>
  );
});
FilterChip.displayName = "FilterChip";

/* --- Converted to named function to satisfy react/display-name --- */
function EmptyList({ s, theme }) {
  return (
    <View style={[s.card, s.emptyCard]}>
      <Ionicons
        name="document-outline"
        size={36}
        color={theme.colors.textMuted}
      />
      <Text style={s.emptyTitle}>No hay trámites</Text>
      <Text style={s.emptyText}>
        Crea tu primer trámite con el botón “Nuevo Trámite”.
      </Text>
    </View>
  );
}
EmptyList.displayName = "EmptyList";

/* -------------------------
   Helper formatting
   ------------------------- */
function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return String(iso || "");
  }
}
function badgeByState(s) {
  if (s === "Completado") return "badgeDone";
  if (s === "En Proceso") return "badgeWip";
  return "badgePend";
}

/* ----------------------------------
   Pantalla principal: TramitesScreen
   ---------------------------------- */
export default function TramitesScreen() {
  const { theme } = useTheme();
  const s = mkStyles(theme);

  const router = useRouter();

  const [items, setItems] = useState(MOCK_TRAMITES);
  const [estado, setEstado] = useState("Todos");
  const [q, setQ] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const searchTimeout = useRef(null);
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(
      () => setDebouncedQ(q.trim().toLowerCase()),
      300
    );
    return () => clearTimeout(searchTimeout.current);
  }, [q]);

  const filtered = useMemo(() => {
    const text = debouncedQ || "";
    return items.filter((t) => {
      const okEstado = estado === "Todos" ? true : t.estado === estado;
      const hayTexto =
        !text ||
        (t.titulo + " " + (t.ref || "") + " " + (t.cliente || ""))
          .toLowerCase()
          .includes(text);
      return okEstado && hayTexto;
    });
  }, [items, estado, debouncedQ]);

  const nuevo = useCallback(() => {
    router.push("/(app)/tramites/nuevo");
  }, [router]);

  const editar = useCallback(
    (t) => {
      DeviceEventEmitter.emit("tramite:prefill", t);
      router.push(`/(app)/tramites/editar?id=${encodeURIComponent(t.id)}`);
    },
    [router]
  );

  const eliminar = useCallback((t) => {
    Alert.alert(
      "Eliminar trámite",
      `¿Seguro que deseas eliminar “${t.titulo}”?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => setItems((prev) => prev.filter((x) => x.id !== t.id)),
        },
      ]
    );
  }, []);

  useEffect(() => {
    const c1 = DeviceEventEmitter.addListener("tramite:created", (nuevo) => {
      setItems((prev) => [nuevo, ...prev]);
    });
    const c2 = DeviceEventEmitter.addListener("tramite:updated", (upd) => {
      setItems((prev) =>
        prev.map((t) => (t.id === upd.id ? { ...t, ...upd } : t))
      );
    });
    const c3 = DeviceEventEmitter.addListener("tramite:deleted", (id) => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    });
    return () => {
      c1.remove();
      c2.remove();
      c3.remove();
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      setItems((prev) => [...prev]);
    } catch (e) {
      Alert.alert("Error", "No se pudieron actualizar los trámites.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={s.card}>
        <Text style={s.title}>{item.titulo}</Text>

        <Text style={s.subLine}>
          <Text style={s.muted}>Ref: </Text>
          {item.ref}
        </Text>

        <Text style={s.subLine}>
          <Text style={s.muted}>Cliente: </Text>
          {item.cliente}
        </Text>

        <View style={s.row}>
          <Text style={[s.badge, s[badgeByState(item.estado)]]}>
            {item.estado}
          </Text>
          <Text style={s.dateText}>{formatDate(item.creadoEl)}</Text>
        </View>

        <View style={s.cardFooter}>
          <TouchableOpacity
            style={[s.btn, s.btnEdit]}
            onPress={() => editar(item)}
            activeOpacity={theme.opacity.pressed}
            accessibilityLabel={`Editar ${item.titulo}`}
          >
            <Ionicons
              name="create-outline"
              size={16}
              color={theme.colors.onAccent}
            />
            <Text style={[s.btnText, { color: theme.colors.onAccent }]}>
              Editar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.btn, s.btnDelete]}
            onPress={() => eliminar(item)}
            activeOpacity={theme.opacity.pressed}
            accessibilityLabel={`Eliminar ${item.titulo}`}
          >
            <Ionicons
              name="trash-outline"
              size={16}
              color={theme.colors.onDanger}
            />
            <Text style={[s.btnText, { color: theme.colors.onDanger }]}>
              Eliminar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [s, editar, eliminar, theme]
  );

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <AppBar variant="section" title="Mis Trámites" showBorder={false} />

      <View style={s.actions}>
        <FlatList
          data={["Todos", "Pendiente", "En Proceso", "Completado"]}
          horizontal
          keyExtractor={(x) => x}
          renderItem={({ item }) => (
            <FilterChip
              label={item}
              active={estado === item}
              onPress={() => setEstado(item)}
              s={s}
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsContainer}
        />

        <View style={s.searchWrap}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Buscar por título, referencia o cliente…"
            placeholderTextColor={theme.colors.textMuted}
            style={s.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
            accessibilityLabel="Buscar trámites"
          />
        </View>

        <TouchableOpacity
          style={s.cta}
          onPress={nuevo}
          activeOpacity={theme.opacity.pressed}
        >
          <Ionicons
            name="add-circle"
            size={18}
            color={theme.colors.onSecondary}
          />
          <Text style={s.ctaText}>Nuevo Trámite</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={s.listContent}
        ItemSeparatorComponent={() => <View style={s.separator} />}
        ListEmptyComponent={<EmptyList s={s} theme={theme} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            tintColor={theme.colors.textMuted}
            colors={[theme.colors.secondary]}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        }
      />
    </SafeAreaView>
  );
}

/* -------------------------
   Estilos dependientes del tema
   ------------------------- */
const mkStyles = (theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },

    actions: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: theme.spacing.md,
    },

    chip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: theme.radius.pill,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      marginRight: 8,
    },
    chipActive: { backgroundColor: theme.colors.secondary },
    chipText: {
      fontWeight: "700",
      color: theme.colors.text,
      fontSize: theme.font.small,
    },
    chipTextActive: { color: theme.colors.onSecondary },

    chipsContainer: {
      paddingRight: 8,
    },

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
      marginTop: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      color: theme.colors.text,
      fontSize: theme.font.body,
    },

    listContent: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },

    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      ...theme.shadow,
    },

    emptyCard: {
      alignItems: "center",
      paddingVertical: 32,
    },

    title: {
      color: theme.colors.text,
      fontSize: theme.font.h2,
      fontWeight: "800",
      marginBottom: 6,
    },
    subLine: {
      color: theme.colors.textMuted,
      marginBottom: 4,
      fontSize: theme.font.body,
    },
    muted: { color: theme.colors.textMuted },

    row: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },

    badge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: theme.radius.pill,
      fontSize: theme.font.tiny,
      fontWeight: "900",
      overflow: "hidden",
    },
    badgePend: {
      backgroundColor: "rgba(255,176,32,0.15)",
      color: theme.colors.warning,
    },
    badgeWip: {
      backgroundColor: "rgba(76,163,255,0.18)",
      color: theme.colors.secondary,
    },
    badgeDone: {
      backgroundColor: "rgba(46,125,50,0.18)",
      color: theme.colors.success,
    },

    dateText: {
      marginLeft: "auto",
      color: theme.colors.textMuted,
    },

    cardFooter: {
      marginTop: theme.spacing.md,
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
    },
    cta: {
      height: 48,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
      marginTop: theme.spacing.sm,
    },
    ctaText: {
      color: theme.colors.onSecondary,
      fontWeight: "800",
      fontSize: theme.font.body,
      letterSpacing: 0.2,
    },

    btn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      height: 40,
      borderRadius: theme.radius.md,
    },
    btnEdit: { backgroundColor: theme.colors.accent },
    btnDelete: { backgroundColor: theme.colors.danger },
    btnText: { fontWeight: "800" },

    separator: {
      height: 12,
    },

    emptyTitle: {
      marginTop: 8,
      fontSize: theme.font.h3,
      fontWeight: "800",
      color: theme.colors.text,
    },
    emptyText: { color: theme.colors.textMuted, marginTop: 4 },
  });
