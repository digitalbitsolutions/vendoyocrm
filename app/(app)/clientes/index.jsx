// app/(app)/clientes/index.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
  Alert,
  DeviceEventEmitter,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import AppBar from "../../../src/components/AppBar";
import { useTheme } from "../../../src/style/theme";

/* ----------------- MOCK (pone tu mock real aquí) ----------------- */
const MOCK_CLIENTES = [
  {
    id: "c1",
    nombre: "Sergio, Carlos",
    documento: "NIE: z2628852a",
    email: "sergicarrillo96@gmail.com",
    whatsapp: "611568818",
    telefono: "",
    direccion: "carrer de josep estivill 36",
    estado: "activo",
    notas: "",
    tags: ["Barcelona"],
    totalTramites: 0,
    createdAt: "2025-06-21",
  },
  {
    id: "c2",
    nombre: "Miguel, Yesan",
    documento: "DNI: 00286658",
    email: "manager@digitalbitsolutions.com",
    whatsapp: "653252923",
    telefono: "",
    direccion: "Gracia",
    estado: "activo",
    notas: "",
    tags: ["VIP"],
    totalTramites: 1,
    createdAt: "2025-06-19",
  },
  {
    id: "c3",
    nombre: "María López",
    documento: "NIE: X1234567Z",
    email: "maria@example.com",
    whatsapp: "600000002",
    telefono: "931112223",
    direccion: "Hospitalet",
    estado: "inactivo",
    notas: "Pendiente de reactivar",
    tags: [],
    totalTramites: 0,
    createdAt: "2025-05-10",
  },
];

/* ----------------- UI helpers (memoized) ----------------- */

function Card({ children, style, onPress }) {
  const Comp = onPress ? TouchableOpacity : View;
  return (
    <Comp
      style={style}
      {...(onPress
        ? { onPress, activeOpacity: 0.7, accessibilityRole: "button" }
        : {})}
    >
      {children}
    </Comp>
  );
}

const FilterChip = React.memo(function FilterChip({
  label,
  active,
  onPress,
  styles,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fchip,
        active && styles.fchipActive,
        pressed && !active && { opacity: 0.85 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
    >
      <Text style={[styles.fchipText, active && styles.fchipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
});

const ClienteCard = React.memo(function ClienteCard({
  item,
  onEditar,
  onEliminar,
  styles,
  theme,
}) {
  return (
    <Card style={[styles.card, styles.cardPadded]}>
      <View style={styles.headerRow}>
        <View style={styles.avatar} />
        <View style={styles.cardMain}>
          <Text style={styles.name}>{item.nombre}</Text>

          {!!item.documento && (
            <Text style={styles.line}>{item.documento}</Text>
          )}
          {!!item.email && <Text style={styles.line}>Email: {item.email}</Text>}
          {!!item.whatsapp && (
            <Text style={styles.line}>WhatsApp: {item.whatsapp}</Text>
          )}
          {!!item.telefono && (
            <Text style={styles.line}>Teléfono: {item.telefono}</Text>
          )}
          {!!item.direccion && (
            <Text style={styles.line}>Dirección: {item.direccion}</Text>
          )}

          <Text style={styles.badges}>
            {item.estado === "activo" ? "🟢 Activo" : "⚪ Inactivo"}
            {item.totalTramites ? ` • Trámites: ${item.totalTramites}` : ""}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={[styles.btn, styles.btnEdit]}
          onPress={() => onEditar?.(item)}
          activeOpacity={theme.opacity?.pressed ?? 0.7}
          accessibilityLabel={`Editar cliente ${item.nombre}`}
        >
          <Ionicons
            name="create-outline"
            size={16}
            color={theme.colors.onAccent}
          />
          <Text style={[styles.btnText, styles.btnTextAccent]}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnDelete]}
          onPress={() => onEliminar?.(item)}
          activeOpacity={theme.opacity?.pressed ?? 0.7}
          accessibilityLabel={`Eliminar cliente ${item.nombre}`}
        >
          <Ionicons
            name="trash-outline"
            size={16}
            color={theme.colors.onDanger}
          />
          <Text style={[styles.btnText, styles.btnTextDanger]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
});

/* ----------------- Pantalla ----------------- */
export default function ClientesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => mkStyles(theme), [theme]);

  const [items, setItems] = useState(MOCK_CLIENTES);
  const [estado, setEstado] = useState("todos"); // "todos" | "activo" | "inactivo"
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const hayQ = q.trim().toLowerCase();
    return items.filter((c) => {
      const okEstado = estado === "todos" ? true : c.estado === estado;
      const okTexto = !hayQ
        ? true
        : (
            (c.nombre || "") +
            (c.documento || "") +
            (c.email || "") +
            (c.whatsapp || "") +
            (c.telefono || "") +
            (c.direccion || "")
          )
            .toLowerCase()
            .includes(hayQ);
      return okEstado && okTexto;
    });
  }, [items, estado, q]);

  const nuevoCliente = useCallback(() => {
    router.push({ pathname: "/(app)/clientes/nuevo", params: { modal: true } });
  }, [router]);

  const editar = useCallback(
    (item) => {
      DeviceEventEmitter.emit("cliente:prefill", item);
      router.push(`/(app)/clientes/editar?id=${encodeURIComponent(item.id)}`);
    },
    [router]
  );

  const eliminar = useCallback((item) => {
    Alert.alert(
      "Eliminar cliente",
      `¿Seguro que deseas eliminar a ${item.nombre}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () =>
            setItems((prev) => prev.filter((c) => c.id !== item.id)),
        },
      ]
    );
  }, []);

  useEffect(() => {
    const subCreated = DeviceEventEmitter.addListener(
      "cliente:created",
      (nuevo) => {
        setItems((prev) => [nuevo, ...prev]);
      }
    );
    const subUpdated = DeviceEventEmitter.addListener(
      "cliente:updated",
      (upd) => {
        setItems((prev) =>
          prev.map((c) => (c.id === upd.id ? { ...c, ...upd } : c))
        );
      }
    );
    const subDeleted = DeviceEventEmitter.addListener(
      "cliente:deleted",
      (id) => {
        setItems((prev) => prev.filter((c) => c.id !== id));
      }
    );

    return () => {
      try {
        subCreated?.remove?.();
      } catch {}
      try {
        subUpdated?.remove?.();
      } catch {}
      try {
        subDeleted?.remove?.();
      } catch {}
    };
  }, []);

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "left", "right", "bottom"]}
    >
      <AppBar variant="section" title="Clientes" showBorder={false} />

      <View style={styles.actions}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.fchipsContainer}
        >
          <FilterChip
            label="Todos"
            active={estado === "todos"}
            onPress={() => setEstado("todos")}
            styles={styles}
          />
          <FilterChip
            label="Activo"
            active={estado === "activo"}
            onPress={() => setEstado("activo")}
            styles={styles}
          />
          <FilterChip
            label="Inactivo"
            active={estado === "inactivo"}
            onPress={() => setEstado("inactivo")}
            styles={styles}
          />
        </ScrollView>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Buscar por nombre, documento, email, dirección..."
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Buscar clientes"
          />
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={nuevoCliente}
          activeOpacity={theme.opacity?.pressed ?? 0.7}
        >
          <Ionicons
            name="add-circle"
            size={18}
            color={theme.colors.onSecondary}
          />
          <Text style={styles.ctaText}>Nuevo Cliente</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {list.length ? (
          list.map((c) => (
            <ClienteCard
              key={c.id}
              item={c}
              onEditar={editar}
              onEliminar={eliminar}
              styles={styles}
              theme={theme}
            />
          ))
        ) : (
          <Card style={[styles.card, styles.cardCentered]}>
            <Ionicons
              name="people-outline"
              size={32}
              color={theme.colors.textMuted}
            />
            <Text style={styles.emptyTitle}>No hay clientes</Text>
            <Text style={styles.emptyText}>
              Crea tu primer cliente con el botón «Nuevo Cliente».
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ----------------- Estilos (tema-dependientes) ----------------- */
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
    },

    fchipsContainer: {
      paddingHorizontal: theme.spacing.lg,
      alignItems: "center",
    },

    fchip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: theme.radius.pill,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: 8,
    },
    fchipActive: {
      backgroundColor: theme.colors.secondary,
      borderColor: theme.colors.secondary,
    },
    fchipText: {
      fontWeight: "700",
      color: theme.colors.text,
      fontSize: theme.font.small,
    },
    fchipTextActive: { color: theme.colors.onSecondary },

    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      height: 44,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      marginTop: 8,
    },
    searchInput: {
      flex: 1,
      color: theme.colors.text,
      fontSize: theme.font.body,
      marginLeft: 8,
    },

    scroll: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },

    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow,
      marginBottom: theme.spacing.md,
    },
    cardPadded: {
      padding: theme.spacing.lg,
    },
    cardCentered: {
      alignItems: "center",
      padding: theme.spacing.xl,
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    cardMain: { flex: 1 },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.border,
      marginRight: theme.spacing.lg,
      alignSelf: "flex-start",
    },
    name: {
      color: theme.colors.text,
      fontSize: theme.font.h2,
      fontWeight: "800",
      marginBottom: 6,
    },
    line: {
      color: theme.colors.textMuted,
      marginBottom: 4,
      fontSize: theme.font.body,
    },
    badges: {
      color: theme.colors.textMuted,
      marginTop: 8,
      fontStyle: "italic",
    },

    cardFooter: {
      marginTop: theme.spacing.md,
      flexDirection: "row",
      justifyContent: "flex-end",
    },

    btn: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      height: 40,
      borderRadius: theme.radius.md,
      marginLeft: 8,
    },
    btnEdit: { backgroundColor: theme.colors.accent },
    btnDelete: { backgroundColor: theme.colors.danger },
    btnText: { fontWeight: "800" },
    btnTextAccent: { color: theme.colors.onAccent, marginLeft: 6 },
    btnTextDanger: { color: theme.colors.onDanger, marginLeft: 6 },

    cta: {
      height: 48,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      marginTop: 8,
    },
    ctaText: {
      color: theme.colors.onSecondary,
      fontWeight: "800",
      fontSize: theme.font.body,
      marginLeft: 8,
    },

    emptyTitle: {
      marginTop: 8,
      fontSize: theme.font.h3,
      fontWeight: "800",
      color: theme.colors.text,
    },
    emptyText: { color: theme.colors.textMuted, marginTop: 4 },
  });
