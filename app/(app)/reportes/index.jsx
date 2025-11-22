// app/(app)/reportes/index.jsx
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
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppBar from "../../../src/components/AppBar";
import { useTheme } from "../../../src/style/theme";

/* ------------------ Utils: fecha & CSV ------------------ */
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
  return `${m[3]}/${m[2]}/${m[1]}`;
};

const toCSV = (rows) => {
  if (!rows.length) return "";
  const headers = ["cliente", "tramite", "estado", "fecha_inicio", "fecha_fin"];
  const esc = (v) =>
    `"${String(v ?? "").replaceAll(`"`, `""`).replaceAll("\n", " ")}"`;
  const body = rows
    .map((r) =>
      [r.cliente, r.tramite, r.estado, r.fechaInicio, r.fechaFin]
        .map(esc)
        .join(",")
    )
    .join("\n");
  return `${headers.join(",")}\n${body}`;
};

/* ------------------ Mock con paginación (para desarrollo) ------------------ */
function makeMockData(count = 60) {
  const base = [
    {
      cliente: "Miguel, Yesan",
      tramite: "Compraventa Inmueble - Calle Mallorca 128",
      estado: "Pendiente",
      fechaInicio: "2025-06-23",
      fechaFin: "2025-07-03",
    },
    {
      cliente: "Miguel, Yesan",
      tramite: "Trámite de Compra-Venta Inmobiliaria",
      estado: "En Proceso",
      fechaInicio: "2025-06-23",
      fechaFin: "2025-07-06",
    },
    {
      cliente: "Ana Pérez",
      tramite: "Cambio titularidad - Calle Girona 45",
      estado: "Completado",
      fechaInicio: "2025-05-10",
      fechaFin: "2025-05-20",
    },
    {
      cliente: "Pedro Gómez",
      tramite: "Legalización documento X",
      estado: "Pendiente",
      fechaInicio: "2025-09-02",
      fechaFin: "0001-11-30",
    },
  ];
  const arr = new Array(count).fill(0).map((_, i) => {
    const src = base[i % base.length];
    return {
      id: `r-${i + 1}`,
      ...src,
      tramite: `${src.tramite} #${String(i + 1).padStart(3, "0")}`,
    };
  });
  return arr;
}
const MOCK_FULL = makeMockData(60);

async function fetchReportsMock({
  cliente,
  estado,
  fIni,
  fFin,
  page = 1,
  pageSize = 10,
}) {
  let data = MOCK_FULL.filter((r) => {
    if (
      cliente &&
      cliente !== "Todos" &&
      !r.cliente.toLowerCase().includes(String(cliente).toLowerCase())
    )
      return false;
    if (estado && estado !== "Todos" && r.estado !== estado) return false;
    if (fIni) {
      const ri = new Date(r.fechaInicio).getTime();
      if (ri < new Date(fIni).getTime()) return false;
    }
    if (fFin && r.fechaFin !== "0001-11-30") {
      const rf = new Date(r.fechaFin).getTime();
      if (rf > new Date(fFin).getTime()) return false;
    }
    return true;
  });

  const total = data.length;
  const start = (page - 1) * pageSize;
  const slice = data.slice(start, start + pageSize);
  await new Promise((res) => setTimeout(res, 250));
  return { data: slice, total };
}

/* Hook / adaptador (cambiar a tu API real fácilmente) */
async function fetchReportsFromAPI(filters) {
  return fetchReportsMock(filters);
}

/* ------------------ Helpers UI ------------------ */
function stateToStyle(s) {
  if (s === "Completado") return "stateDone";
  if (s === "En Proceso") return "stateWip";
  return "statePend";
}

/* ------------------ Main component ------------------ */
export default function ReportesScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const s = useMemo(() => mkStyles(theme), [theme]);

  // filtros controlados (cliente está debounced)
  const [clienteInput, setClienteInput] = useState("");
  const [cliente, setCliente] = useState("Todos");
  const [estado, setEstado] = useState("Todos");
  const [fIniHuman, setFIniHuman] = useState("");
  const [fFinHuman, setFFinHuman] = useState("");

  // paginación & datos
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [total, setTotal] = useState(0);

  // flags
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // debounce cliente input
  const debounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCliente(clienteInput.trim() === "" ? "Todos" : clienteInput.trim());
      setPage(1);
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [clienteInput]);

  // carga (page aware)
  const loadPage = useCallback(
    async ({ page: loadPage = 1, append = false } = {}) => {
      if (loadPage === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const fIni = toISO(fIniHuman);
        const fFin = toISO(fFinHuman);
        const res = await fetchReportsFromAPI({
          cliente,
          estado,
          fIni,
          fFin,
          page: loadPage,
          pageSize,
        });
        const data = Array.isArray(res.data) ? res.data : [];
        const tot = typeof res.total === "number" ? res.total : data.length;

        setTotal(tot);
        setRows((prev) => (append ? [...prev, ...data] : data));
      } catch (e) {
        setError(e?.message || "Error al obtener datos");
        Alert.alert("Error", e?.message || "No se pudieron obtener los reportes.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [cliente, estado, fIniHuman, fFinHuman]
  );

  // inicial / reload cuando cambian filtros o page
  useEffect(() => {
    loadPage({ page: 1, append: false });
    setPage(1);
  }, [cliente, estado, fIniHuman, fFinHuman, loadPage]);

  // cargar más cuando page incrementa por onEndReached
  useEffect(() => {
    if (page === 1) return;
    loadPage({ page, append: true });
  }, [page, loadPage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadPage({ page: 1, append: false });
  }, [loadPage]);

  const onEndReached = useCallback(() => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (loadingMore || loading) return;
    if (page < totalPages) setPage((p) => p + 1);
  }, [page, total, pageSize, loadingMore, loading]);

  /* Export CSV -> Documents */
  const onExport = useCallback(async () => {
    try {
      const FileSystem = (await import("expo-file-system")).default;
      const Sharing = (await import("expo-sharing")).default;

      const csv = toCSV(rows.length ? rows : []);
      if (!csv) {
        Alert.alert("Sin datos", "No hay filas para exportar.");
        return;
      }

      const filename = `reporte_vendoyo_${Date.now()}.csv`;
      const dir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      const uri = `${dir}${filename}`;

      await FileSystem.writeAsStringAsync(uri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const can = await Sharing.isAvailableAsync();
      if (can) {
        await Sharing.shareAsync(uri, {
          UTI: "public.comma-separated-values-text",
        });
      } else {
        Alert.alert("Exportado", `CSV creado en: ${uri}`);
      }
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Exportar error",
        "Instala 'expo-file-system' y 'expo-sharing' o revisa permisos."
      );
    }
  }, [rows]);

  /* HeaderButton (memo) */
  const [sort, setSort] = useState({ by: "fechaInicio", dir: "asc" });
  const toggleSort = useCallback(
    (by) => {
      setSort((s) => {
        const active = s.by === by;
        return { by, dir: active && s.dir === "asc" ? "desc" : "asc" };
      });
    },
    [setSort]
  );

  /* ReportRow (memo) */
  const ReportRow = useCallback(
    ({ item }) => (
      <View style={s.rowCard} accessible accessibilityRole="listitem">
        <Text style={s.rowTitle}>{item.tramite}</Text>

        <View style={s.rowLine}>
          <Text style={s.rowLabel}>Cliente:</Text>
          <Text style={s.rowValue}>{item.cliente}</Text>
        </View>

        <View style={s.rowLine}>
          <Text style={s.rowLabel}>Estado:</Text>
          <Text style={[s.rowValue, s[stateToStyle(item.estado)]]}>
            {item.estado}
          </Text>
        </View>

        <View style={s.rowGrid}>
          <View style={s.rowCol}>
            <Text style={s.rowLabel}>Inicio</Text>
            <Text style={s.rowValue}>{toHuman(item.fechaInicio)}</Text>
          </View>
          <View style={s.rowCol}>
            <Text style={s.rowLabel}>Final</Text>
            <Text style={s.rowValue}>{toHuman(item.fechaFin)}</Text>
          </View>
        </View>
      </View>
    ),
    [s]
  );

  /* UI: filtros (memoizado) */
  const Filters = useCallback(
    () => (
      <View style={s.filtersCard}>
        <Text style={s.filterTitle}>Filtros</Text>

        <Text style={s.label}>Cliente</Text>
        <TextInput
          style={s.input}
          placeholder="Todos o escribe un nombre"
          placeholderTextColor={theme.colors.textMuted}
          value={clienteInput}
          onChangeText={setClienteInput}
          accessibilityLabel="Filtro por cliente"
        />

        <Text style={s.label}>Estado</Text>
        <View style={s.chipsRow}>
          {["Todos", "Pendiente", "En Proceso", "Completado"].map((st) => {
            const active = estado === st;
            return (
              <Pressable
                key={st}
                onPress={() => {
                  setEstado(st);
                  setPage(1);
                }}
                style={[s.chip, active && s.chipActive]}
                hitSlop={theme.hitSlop}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {st}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={s.label}>Fecha de Inicio</Text>
        <TextInput
          style={s.input}
          placeholder="dd/mm/aaaa"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType={
            Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"
          }
          value={fIniHuman}
          onChangeText={setFIniHuman}
        />

        <Text style={s.label}>Fecha Final</Text>
        <TextInput
          style={s.input}
          placeholder="dd/mm/aaaa"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType={
            Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"
          }
          value={fFinHuman}
          onChangeText={setFFinHuman}
        />

        <Pressable
          style={s.genBtn}
          onPress={() => {
            setPage(1);
            loadPage({ page: 1, append: false });
          }}
          hitSlop={theme.hitSlop}
          accessibilityRole="button"
        >
          <Ionicons
            name="bar-chart-outline"
            size={18}
            color={theme.colors.onSecondary}
          />
          <Text style={s.genTxt}>Generar Reporte</Text>
        </Pressable>
      </View>
    ),
    [s, clienteInput, estado, fIniHuman, fFinHuman, theme]
  );

  /* HeaderButtons render */
  const HeaderButtons = useCallback(
    () => (
      <View style={s.tableHeader}>
        {[
          { label: "Cliente", by: "cliente" },
          { label: "Nombre del trámite", by: "tramite" },
          { label: "Estado", by: "estado" },
          { label: "Fecha inicio", by: "fechaInicio" },
          { label: "Fecha final", by: "fechaFin" },
        ].map((h) => {
          const active = sort.by === h.by;
          return (
            <Pressable
              key={h.by}
              onPress={() => toggleSort(h.by)}
              style={s.thBtn}
              hitSlop={theme.hitSlop}
              accessibilityRole="button"
              accessibilityLabel={`Ordenar por ${h.label}`}
            >
              <Text
                style={[s.thText, active && { color: theme.colors.secondary }]}
              >
                {h.label}
              </Text>
              <Ionicons
                name={
                  !active
                    ? "swap-vertical-outline"
                    : sort.dir === "asc"
                    ? "caret-up-outline"
                    : "caret-down-outline"
                }
                size={16}
                color={active ? theme.colors.secondary : theme.colors.textMuted}
                style={s.sortIcon}
              />
            </Pressable>
          );
        })}
      </View>
    ),
    [s, sort, toggleSort, theme]
  );

  /* empty / footer UI */
  const ListFooter = () =>
    loadingMore ? (
      <View style={s.loadingWrap}>
        <ActivityIndicator color={theme.colors.secondary} />
      </View>
    ) : null;

  const ItemSeparator = () => <View style={s.sep} />;

  /* sorted client-side fallback */
  const sortedRows = useMemo(() => {
    const list = [...rows];
    list.sort((a, b) => {
      const av = a[sort.by] ?? "";
      const bv = b[sort.by] ?? "";
      if (av === bv) return 0;
      const res = av > bv ? 1 : -1;
      return sort.dir === "asc" ? res : -res;
    });
    return list;
  }, [rows, sort]);

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <AppBar variant="section" title="Reportes" showBorder={false} />

      <View style={s.actions}>
        <Pressable
          style={s.cta}
          onPress={onExport}
          accessibilityRole="button"
          accessibilityLabel="Exportar CSV"
        >
          <Ionicons
            name="download-outline"
            size={18}
            color={theme.colors.onSecondary}
          />
          <Text style={s.ctaText}>Exportar CSV</Text>
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={s.flatContent}
        data={sortedRows}
        keyExtractor={(r) => r.id}
        ListHeaderComponent={
          <>
            <Filters />
            <HeaderButtons />
            {loading && (
              <View style={s.loadingWrap}>
                <ActivityIndicator color={theme.colors.secondary} />
              </View>
            )}
          </>
        }
        renderItem={ReportRow}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={() =>
          !loading ? (
            <View style={s.emptyBox}>
              <Ionicons
                name="cloud-offline-outline"
                size={22}
                color={theme.colors.textMuted}
              />
              <Text style={s.emptyText}>Sin resultados</Text>
            </View>
          ) : null
        }
        onEndReachedThreshold={0.6}
        onEndReached={onEndReached}
        ListFooterComponent={ListFooter}
        refreshing={refreshing}
        onRefresh={onRefresh}
        initialNumToRender={8}
        windowSize={6}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
}

/* ------------------ Estilos (RN friendly) ------------------ */
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
    cta: {
      height: 48,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      paddingHorizontal: 14,
    },
    ctaText: {
      color: theme.colors.onSecondary,
      fontWeight: "800",
      fontSize: theme.font.body,
      marginLeft: 8,
    },

    filtersCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadow,
    },
    filterTitle: {
      fontWeight: "900",
      fontSize: theme.font.h3,
      color: theme.colors.text,
      marginBottom: 8,
    },

    label: {
      marginTop: 8,
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

    chipsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: theme.radius.pill,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      marginRight: 8,
      marginBottom: 8,
    },
    chipActive: { backgroundColor: theme.colors.secondary },
    chipText: {
      fontWeight: "700",
      color: theme.colors.text,
      fontSize: theme.font.small,
    },
    chipTextActive: { color: theme.colors.onSecondary },

    genBtn: {
      marginTop: 12,
      height: 48,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      paddingHorizontal: 14,
    },
    genTxt: {
      color: theme.colors.onSecondary,
      fontWeight: "900",
      fontSize: theme.font.body,
      marginLeft: 8,
    },

    tableHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    thBtn: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: theme.radius.pill,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      marginRight: 8,
      marginBottom: 8,
    },
    thText: {
      fontSize: theme.font.small,
      fontWeight: "800",
      color: theme.colors.text,
    },
    sortIcon: { marginLeft: 8 },

    rowCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadow,
    },
    rowTitle: {
      fontSize: theme.font.h3,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: 8,
    },
    rowLine: { flexDirection: "row", alignItems: "baseline", marginBottom: 6 },
    rowLabel: {
      color: theme.colors.textMuted,
      fontSize: theme.font.small,
      fontWeight: "700",
      marginRight: 8,
    },
    rowValue: {
      color: theme.colors.text,
      fontSize: theme.font.body,
      flexShrink: 1,
    },
    rowGrid: { flexDirection: "row", marginTop: 4 },
    rowCol: { flex: 1 },

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
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    emptyText: { color: theme.colors.textMuted, marginTop: 6 },

    flatContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: Math.max(16, theme.spacing.xl),
    },

    sep: { height: 10 },

    loadingWrap: { paddingVertical: 12, alignItems: "center" },
  });
