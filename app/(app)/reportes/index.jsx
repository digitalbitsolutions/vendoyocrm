import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppBar from "../../../src/components/AppBar";
import { useTheme } from "../../../src/style/theme";

/* =================== Utils fecha & CSV =================== */
const toISO = (d) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((d || "").trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
};

const toHuman = (iso) => {
  if (!iso) return "";
  const s = String(iso).slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return "";
  const y = parseInt(m[1], 10);
  if (y < 1900) return "—";
  return `${m[3]}/${m[2]}/${m[1]}`;
};

const toCSV = (rows) => {
  if (!rows.length) return "";
  const headers = ["cliente", "tramite", "estado", "fecha_inicio", "fecha_fin"];
  const esc = (v) => `"${String(v ?? "").replaceAll(`"`, `""`).replaceAll("\n", " ")}"`;
  const body = rows
    .map((r) => [r.cliente, r.tramite, r.estado, r.fechaInicio, r.fechaFin].map(esc).join(","))
    .join("\n");
  return `${headers.join(",")}\n${body}`;
};

/* =================== Mock + filtro local (simula backend) =================== */
async function fetchReportsMock({ cliente, estado, fIni, fFin }) {
  const data = [
    {
      id: "r1",
      cliente: "Miguel, Yesan",
      tramite: "1",
      estado: "Pendiente",
      fechaInicio: "2025-09-02",
      fechaFin: "0001-11-30",
    },
    {
      id: "r2",
      cliente: "Miguel, Yesan",
      tramite: "Compraventa Inmueble - Calle Mallorca 128",
      estado: "Pendiente",
      fechaInicio: "2025-06-23",
      fechaFin: "2025-07-03",
    },
    {
      id: "r3",
      cliente: "Miguel, Yesan",
      tramite: "Trámite de Compra-Venta Inmobiliaria",
      estado: "Pendiente",
      fechaInicio: "2025-06-23",
      fechaFin: "2025-07-06",
    },
  ];

  return data.filter((r) => {
    if (cliente && cliente !== "Todos" && !r.cliente.toLowerCase().includes(String(cliente).toLowerCase())) {
      return false;
    }
    if (estado && estado !== "Todos" && r.estado !== estado) return false;

    const ri = new Date(r.fechaInicio).getTime();
    const rf = new Date(r.fechaFin).getTime();
    const iOk = !fIni || ri >= new Date(fIni).getTime();
    const fOk = !fFin || rf <= new Date(fFin).getTime();
    return iOk && fOk;
  });
}

/* =================== Hook para backend (enchufar luego) =================== */
async function fetchReportsFromAPI(filters) {
  return fetchReportsMock(filters);
}

/* =================== Helpers UI =================== */
function stateToStyle(s) {
  if (s === "Completado") return "stateDone";
  if (s === "En Proceso") return "stateWip";
  return "statePend";
}

/* =================== Pantalla =================== */
export default function ReportesScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const s = mkStyles(theme);

  // Filtros
  const [cliente, setCliente] = useState("Todos");
  const [estado, setEstado] = useState("Todos");
  const [fIniHuman, setFIniHuman] = useState("");
  const [fFinHuman, setFFinHuman] = useState("");

  // Datos/UI
  const [rows, setRows] = useState([]);
  const [sort, setSort] = useState({ by: "fechaInicio", dir: "asc" });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = async () => {
    const fIni = toISO(fIniHuman);
    const fFin = toISO(fFinHuman);
    const data = await fetchReportsFromAPI({ cliente, estado, fIni, fFin });
    setRows(data);
    setPage(1);
  };

  useEffect(() => {
    load();
  }, []);

  // Orden
  const sorted = useMemo(() => {
    const list = [...rows];
    list.sort((a, b) => {
      const av = a[sort.by];
      const bv = b[sort.by];
      if (av === bv) return 0;
      const res = av > bv ? 1 : -1;
      return sort.dir === "asc" ? res : -res;
    });
    return list;
  }, [rows, sort]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  // Export CSV
  const onExport = async () => {
    try {
      const FileSystem = (await import("expo-file-system")).default;
      const Sharing = (await import("expo-sharing")).default;
      const csv = toCSV(sorted);
      const uri = FileSystem.cacheDirectory + `reporte_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      const can = await Sharing.isAvailableAsync();
      if (can) {
        await Sharing.shareAsync(uri, { UTI: "public.comma-separated-values-text" });
      } else {
        Alert.alert("Exportado", `Archivo CSV creado en: ${uri}`);
      }
    } catch (e) {
      Alert.alert("Módulos requeridos", "Instala: expo-file-system y expo-sharing");
    }
  };

  // Botón de cabecera (vive dentro para usar theme)
  const HeaderButton = ({ label, by }) => {
    const active = sort.by === by;
    const nextDir = active && sort.dir === "asc" ? "desc" : "asc";
    return (
      <Pressable onPress={() => setSort({ by, dir: nextDir })} style={s.thBtn} hitSlop={theme.hitSlop}>
        <Text style={[s.thText, active && { color: theme.colors.secondary }]}>{label}</Text>
        <Ionicons
          name={!active ? "swap-vertical-outline" : sort.dir === "asc" ? "caret-up-outline" : "caret-down-outline"}
          size={16}
          color={active ? theme.colors.secondary : theme.colors.textMuted}
        />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <AppBar variant="section" title="Reportes" showBorder={false} />

      {/* CTA Exportar */}
      <View style={s.actions}>
        <TouchableOpacity style={s.cta} onPress={onExport} activeOpacity={theme.opacity.pressed}>
          <Ionicons name="download-outline" size={18} color={theme.colors.onSecondary} />
          <Text style={s.ctaText}>Exportar CSV</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: Math.max(insets.bottom, theme.spacing.xl),
          gap: theme.spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Filtros */}
        <View style={s.filtersCard}>
          <Text style={s.filterTitle}>Filtros</Text>

          <Text style={s.label}>Cliente</Text>
          <TextInput
            style={s.input}
            placeholder="Todos o escribe un nombre"
            placeholderTextColor={theme.colors.textMuted}
            value={cliente}
            onChangeText={setCliente}
          />

          <Text style={s.label}>Estado</Text>
          <View style={s.chipsRow}>
            {["Todos", "Pendiente", "En Proceso", "Completado"].map((st) => {
              const active = estado === st;
              return (
                <Pressable
                  key={st}
                  onPress={() => setEstado(st)}
                  style={[s.chip, active && s.chipActive]}
                  hitSlop={theme.hitSlop}
                >
                  <Text style={[s.chipText, active && s.chipTextActive]}>{st}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={s.label}>Fecha de Inicio</Text>
          <TextInput
            style={s.input}
            placeholder="dd/mm/aaaa"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"}
            value={fIniHuman}
            onChangeText={setFIniHuman}
          />

          <Text style={s.label}>Fecha Final</Text>
          <TextInput
            style={s.input}
            placeholder="dd/mm/aaaa"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"}
            value={fFinHuman}
            onChangeText={setFFinHuman}
          />

          <Pressable style={s.genBtn} onPress={load} hitSlop={theme.hitSlop}>
            <Ionicons name="bar-chart-outline" size={18} color={theme.colors.onSecondary} />
            <Text style={s.genTxt}>Generar Reporte</Text>
          </Pressable>
        </View>

        {/* Encabezados de “tabla” */}
        <View style={s.tableHeader}>
          <HeaderButton label="Cliente" by="cliente" />
          <HeaderButton label="Nombre del trámite" by="tramite" />
          <HeaderButton label="Estado" by="estado" />
          <HeaderButton label="Fecha inicio" by="fechaInicio" />
          <HeaderButton label="Fecha final" by="fechaFin" />
        </View>

        {/* Lista */}
        <View style={{ gap: 10 }}>
          {pageRows.map((r) => (
            <View key={r.id} style={s.rowCard}>
              <Text style={s.rowTitle}>{r.tramite}</Text>

              <View style={s.rowLine}>
                <Text style={s.rowLabel}>Cliente:</Text>
                <Text style={s.rowValue}>{r.cliente}</Text>
              </View>

              <View style={s.rowLine}>
                <Text style={s.rowLabel}>Estado:</Text>
                <Text style={[s.rowValue, s[stateToStyle(r.estado)]]}>{r.estado}</Text>
              </View>

              <View style={s.rowGrid}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowLabel}>Inicio</Text>
                  <Text style={s.rowValue}>{toHuman(r.fechaInicio)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowLabel}>Final</Text>
                  <Text style={s.rowValue}>{toHuman(r.fechaFin)}</Text>
                </View>
              </View>
            </View>
          ))}

          {!pageRows.length && (
            <View style={s.emptyBox}>
              <Ionicons name="cloud-offline-outline" size={22} color={theme.colors.textMuted} />
              <Text style={{ color: theme.colors.textMuted }}>Sin resultados</Text>
            </View>
          )}
        </View>

        {/* Paginación */}
        <View style={s.pagination}>
          <Pressable
            style={[s.pageBtn, page === 1 && s.pageBtnDisabled]}
            onPress={() => page > 1 && setPage(page - 1)}
            disabled={page === 1}
            hitSlop={theme.hitSlop}
          >
            <Ionicons name="chevron-back" size={18} color={theme.colors.onSecondary} />
          </Pressable>

          <View style={s.pageBadge}>
            <Text style={s.pageBadgeTxt}>
              {page} / {totalPages}
            </Text>
          </View>

          <Pressable
            style={[s.pageBtn, page === totalPages && s.pageBtnDisabled]}
            onPress={() => page < totalPages && setPage(page + 1)}
            disabled={page === totalPages}
            hitSlop={theme.hitSlop}
          >
            <Ionicons name="chevron-forward" size={18} color={theme.colors.onSecondary} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =================== Estilos dependientes del tema =================== */
const mkStyles = (theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },

    // Acciones (CTA Exportar)
    actions: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    cta: {
      height: 48,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    ctaText: { color: theme.colors.onSecondary, fontWeight: "800", fontSize: theme.font.body },

    filtersCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      ...theme.shadow,
      gap: 8,
    },
    filterTitle: { fontWeight: "900", fontSize: theme.font.h3, color: theme.colors.text, marginBottom: 4 },

    label: {
      marginTop: theme.spacing.sm,
      marginBottom: 6,
      fontSize: theme.font.small,
      fontWeight: "800",
      color: theme.colors.text,
    },
    input: {
      height: 44,
      paddingHorizontal: 12,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      fontSize: theme.font.body,
    },

    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    },
    chipActive: { backgroundColor: theme.colors.secondary },
    chipText: { fontWeight: "700", color: theme.colors.text, fontSize: theme.font.small },
    chipTextActive: { color: theme.colors.onSecondary },

    genBtn: {
      marginTop: theme.spacing.md,
      height: 48,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    genTxt: { color: theme.colors.onSecondary, fontWeight: "900", fontSize: theme.font.body },

    tableHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    thBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: theme.radius.pill,
    },
    thText: { fontSize: theme.font.small, fontWeight: "800", color: theme.colors.text },

    rowCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      ...theme.shadow,
      gap: 8,
    },
    rowTitle: { fontSize: theme.font.h3, fontWeight: "900", color: theme.colors.text },
    rowLine: { flexDirection: "row", gap: 8, alignItems: "baseline" },
    rowLabel: { color: theme.colors.textMuted, fontSize: theme.font.small, fontWeight: "700" },
    rowValue: { color: theme.colors.text, fontSize: theme.font.body, flexShrink: 1 },
    rowGrid: { flexDirection: "row", gap: 16, marginTop: 4 },

    statePend: { color: theme.colors.warning, fontWeight: "800" },
    stateWip: { color: theme.colors.secondary, fontWeight: "800" },
    stateDone: { color: theme.colors.success, fontWeight: "800" },

    emptyBox: {
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 6,
    },

    pagination: {
      marginTop: theme.spacing.lg,
      marginBottom: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    pageBtn: {
      height: 40,
      width: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    pageBtnDisabled: { opacity: theme.opacity.disabled },
    pageBadge: {
      paddingHorizontal: 14,
      height: 40,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      alignItems: "center",
      justifyContent: "center",
    },
    pageBadgeTxt: { fontWeight: "800", color: theme.colors.text },
  });
