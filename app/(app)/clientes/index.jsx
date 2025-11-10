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

/* ----------------- MOCK ----------------- */
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

/* ----------------- UI helpers ----------------- */
function Card({ children, style, onPress }) {
  const Comp = onPress ? TouchableOpacity : View;
  return (
    <Comp
      style={[s.card, style]}
      {...(onPress ? { onPress, activeOpacity: 0.7, accessibilityRole: "button" } : {})}
    >
      {children}
    </Comp>
  );
}

function FilterChip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.fchip, active && s.fchipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
    >
      <Text style={[s.fchipText, active && s.fchipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ClienteCard({ item, onEditar, onEliminar, theme }) {
  return (
    <Card style={{ padding: theme.spacing.lg }}>
      {/* Cabecera: avatar + nombre */}
      <View style={{ flexDirection: "row", gap: theme.spacing.lg }}>
        <View style={s.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{item.nombre}</Text>

          {!!item.documento && <Text style={s.line}>{item.documento}</Text>}
          {!!item.email && <Text style={s.line}>Email: {item.email}</Text>}
          {!!item.whatsapp && <Text style={s.line}>WhatsApp: {item.whatsapp}</Text>}
          {!!item.telefono && <Text style={s.line}>Teléfono: {item.telefono}</Text>}
          {!!item.direccion && <Text style={s.line}>Dirección: {item.direccion}</Text>}

          <Text style={s.badges}>
            {item.estado === "activo" ? "🟢 Activo" : "⚪ Inactivo"}
            {item.totalTramites ? ` • Trámites: ${item.totalTramites}` : ""}
          </Text>
        </View>
      </View>

      {/* Acciones */}
      <View style={s.cardFooter}>
        <TouchableOpacity
          style={[s.btn, s.btnEdit]}
          onPress={() => onEditar?.(item)}
          activeOpacity={theme.opacity.pressed}
          accessibilityLabel={`Editar cliente ${item.nombre}`}
        >
          <Ionicons name="create-outline" size={16} color={theme.colors.onAccent} />
          <Text style={[s.btnText, { color: theme.colors.onAccent }]}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.btn, s.btnDelete]}
          onPress={() => onEliminar?.(item)}
          activeOpacity={theme.opacity.pressed}
          accessibilityLabel={`Eliminar cliente ${item.nombre}`}
        >
          <Ionicons name="trash-outline" size={16} color={theme.colors.onDanger} />
          <Text style={[s.btnText, { color: theme.colors.onDanger }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

/* ----------------- Pantalla ----------------- */
export default function ClientesScreen() {
  const router = useRouter();
  const { theme } = useTheme();          // ✅ tema reactivo
  s = mkStyles(theme);                   // ✅ estilos dependientes del tema

  const [items, setItems] = useState(MOCK_CLIENTES);
  const [estado, setEstado] = useState("todos"); // "todos" | "activo" | "inactivo"
  const [q, setQ] = useState("");

  // Filtro (texto + estado)
  const list = useMemo(() => {
    const hayQ = q.trim().toLowerCase();
    return items.filter((c) => {
      const okEstado = estado === "todos" ? true : c.estado === estado;
      const okTexto = !hayQ
        ? true
        : (c.nombre + c.documento + c.email + c.whatsapp + c.telefono + c.direccion) // ✅ c.telefono (sin espacio)
            .toLowerCase()
            .includes(hayQ);
      return okEstado && okTexto;
    });
  }, [items, estado, q]);

  // Navegación
  const nuevoCliente = useCallback(() => {
    router.push("/(app)/clientes/nuevo");
  }, [router]);

  const editar = useCallback(
    (item) => {
      DeviceEventEmitter.emit("cliente:prefill", item);
      router.push(`/(app)/clientes/editar?id=${encodeURIComponent(item.id)}`);
    },
    [router]
  );

  const eliminar = useCallback((item) => {
    Alert.alert("Eliminar cliente", `¿Seguro que deseas eliminar a ${item.nombre}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => setItems((prev) => prev.filter((c) => c.id !== item.id)),
      },
    ]);
  }, []);

  // Eventos create/update/delete
  useEffect(() => {
    const subCreated = DeviceEventEmitter.addListener("cliente:created", (nuevo) => {
      setItems((prev) => [nuevo, ...prev]);
    });
    const subUpdated = DeviceEventEmitter.addListener("cliente:updated", (upd) => {
      setItems((prev) => prev.map((c) => (c.id === upd.id ? { ...c, ...upd } : c)));
    });
    const subDeleted = DeviceEventEmitter.addListener("cliente:deleted", (id) => {
      setItems((prev) => prev.filter((c) => c.id !== id));
    });

    return () => {
      subCreated.remove();
      subUpdated.remove();
      subDeleted.remove();
    };
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <AppBar variant="section" title="Clientes" showBorder={false} />

      {/* Acciones */}
      <View style={s.actions}>
        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <FilterChip label="Todos" active={estado === "todos"} onPress={() => setEstado("todos")} />
          <FilterChip label="Activo" active={estado === "activo"} onPress={() => setEstado("activo")} />
          <FilterChip label="Inactivo" active={estado === "inactivo"} onPress={() => setEstado("inactivo")} />
        </ScrollView>

        {/* Buscador */}
        <View style={s.searchWrap}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Buscar por nombre, documento, email, dirección..."
            placeholderTextColor={theme.colors.textMuted}
            style={s.searchInput}
            returnKeyType="search"
          />
        </View>

        {/* CTA: Nuevo Cliente */}
        <TouchableOpacity style={s.cta} onPress={nuevoCliente} activeOpacity={theme.opacity.pressed}>
          <Ionicons name="add-circle" size={18} color={theme.colors.onSecondary} />
          <Text style={s.ctaText}>Nuevo Cliente</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {list.length ? (
          list.map((c) => <ClienteCard key={c.id} item={c} onEditar={editar} onEliminar={eliminar} theme={theme} />)
        ) : (
          <Card style={{ alignItems: "center", padding: theme.spacing.xl }}>
            <Ionicons name="people-outline" size={32} color={theme.colors.textMuted} />{/* ✅ nombre del icono */}
            <Text style={s.emptyTitle}>No hay clientes</Text>
            <Text style={s.emptyText}>Crea tu primer cliente con el botón "Nuevo Cliente".</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ----------------- Estilos (tema-dependientes) ----------------- */
let s; // ⚠️ declaramos referencia para poder usarla arriba en helpers (Card/Chip)
const mkStyles = (theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },

    // Acciones
    actions: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },

    // Filtro chip
    fchip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", // ✅ dark friendly
      borderWidth: 1,
      borderColor: theme.colors.border,
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
    searchInput: { flex: 1, color: theme.colors.text, fontSize: theme.font.body },

    // Contenido
    scroll: {
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },

    // Card
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow,
    },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.border,
      alignSelf: "flex-start",
    },
    name: {
      color: theme.colors.text,
      fontSize: theme.font.h2,
      fontWeight: "800",
      marginBottom: 6,
    },
    line: { color: theme.colors.textMuted, marginBottom: 4, fontSize: theme.font.body },
    badges: { color: theme.colors.textMuted, marginTop: 8, fontStyle: "italic" },

    cardFooter: {
      marginTop: theme.spacing.md,
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
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

    // Empty state
    emptyTitle: {
      marginTop: 8,
      fontSize: theme.font.h3,
      fontWeight: "800",
      color: theme.colors.text,
    },
    emptyText: { color: theme.colors.textMuted, marginTop: 4 },
  });
