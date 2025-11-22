// app/(app)/historial/index.jsx
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
  RefreshControl,
  ActivityIndicator,
  Platform,
  Animated,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AppBar from "../../../src/components/AppBar";
import ActivityItem from "../../../src/components/ActivityItem";
import { useTheme } from "../../../src/style/theme";

/* ---------------- CONFIG ----------------
 * Cambia aquí si quieres mostrar/ocultar el pill:
 * - true  -> pill visible (con tamaño reducido)
 * - false -> pill oculto (solo AppBar queda)
 */
const SHOW_PILL = false;

/* ---------- Mock / util ---------- */
const MOCK = [
  {
    id: "a1",
    type: "create",
    title: "Nuevo trámite 1 creado por Miguel Yesan.",
    metaDate: "2025-09-02T13:21:00Z",
  },
  {
    id: "a2",
    type: "create",
    title: "Nuevo trámite 2 creado por Miguel Yesan.",
    metaDate: "2025-09-02T13:21:00Z",
  },
  {
    id: "a3",
    type: "update",
    title:
      "José María Bardina actualizó los datos del trámite Trámite de Compra-Venta Inmobiliaria.",
    refLabel: "Referencia:",
    beforeAfter: {
      "Antes:": "Recomendado por Miguel",
      "Después:": "CV-2025-0036",
    },
    metaDate: "2025-06-23T10:46:00Z",
  },
  {
    id: "a4",
    type: "create",
    title:
      "Nuevo trámite Compraventa Inmueble - Calle Mallorca 128 creado por José María Bardina.",
    metaDate: "2025-06-23T10:45:00Z",
  },
  {
    id: "a5",
    type: "update",
    title:
      "José María Bardina actualizó los datos del trámite Trámite de Compra-Venta Inmobiliaria.",
    refLabel: "Fecha estimada de finalización:",
    beforeAfter: { "Antes:": "2025-07-05", "Después:": "2025-07-06" },
    metaDate: "2025-06-23T10:43:00Z",
  },
  {
    id: "a6",
    type: "create",
    title:
      "Nuevo trámite Trámite de Compra-Venta Inmobiliaria creado por José María Bardina.",
    metaDate: "2025-06-23T10:42:00Z",
  },
];

const formatDateTime = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
};

/* ---------- Screen (pill reducido / opcional) ---------- */
export default function HistorialScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const s = mkStyles(theme);

  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Animated scroll value
  const scrollY = useRef(new Animated.Value(0)).current;
  const AFlatList = Animated.createAnimatedComponent(FlatList);

  useEffect(() => {
    const t = setTimeout(() => {
      setItems(MOCK);
      setLoadingInitial(false);
    }, 220);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setItems((prev) => [...MOCK]);
      setRefreshing(false);
    }, 700);
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => {
      const isLast = index === items.length - 1;
      return <ActivityItem item={item} isLast={isLast} />;
    },
    [items]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const ListEmpty = () => (
    <View style={s.empty}>
      <Text style={s.emptyTitle}>No hay actividad todavía</Text>
      <Text style={s.emptyHint}>
        Cuando haya acciones recientes las verás aquí.
      </Text>
    </View>
  );

  /* Animaciones para el pill (si está activo):
     - SHRINK más suave y menos agresivo
     - fontWeight reducido para que no compita con AppBar
  */
  const SHRINK_AT = 48;
  const pillPadding = scrollY.interpolate({
    inputRange: [0, SHRINK_AT],
    outputRange: [theme.spacing.md * 0.9, theme.spacing.xs * 1.1],
    extrapolate: "clamp",
  });
  const pillFontSize = scrollY.interpolate({
    inputRange: [0, SHRINK_AT],
    outputRange: [theme.font.h3 + 6, theme.font.h3], // pequeño ajuste
    extrapolate: "clamp",
  });
  const pillLineHeight = scrollY.interpolate({
    inputRange: [0, SHRINK_AT],
    outputRange: [theme.font.h3 + 10, theme.font.h3 + 6],
    extrapolate: "clamp",
  });
  const pillScale = scrollY.interpolate({
    inputRange: [0, SHRINK_AT],
    outputRange: [1, 0.98],
    extrapolate: "clamp",
  });
  const pillScaleX = scrollY.interpolate({
    inputRange: [0, SHRINK_AT],
    outputRange: [1, 0.92],
    extrapolate: "clamp",
  });
  const pillTranslateY = scrollY.interpolate({
    inputRange: [0, SHRINK_AT],
    outputRange: [0, -4],
    extrapolate: "clamp",
  });

  /* Header con pill animada (sticky) - si SHOW_PILL === false devolvemos un spacer */
  function ListHeader() {
    const AView = Animated.View;
    const AText = Animated.Text;

    if (!SHOW_PILL) {
      // pequeño spacer para separar el contenido del AppBar
      return (
        <View
          style={{
            height: theme.spacing.lg / 1.4,
            backgroundColor: theme.colors.background,
          }}
        />
      );
    }

    return (
      <View style={s.headerWrap}>
        <AView
          style={[
            s.pillContainer,
            {
              paddingVertical: pillPadding,
              transform: [
                { translateY: pillTranslateY },
                { scale: pillScale },
                { scaleX: pillScaleX },
              ],
            },
          ]}
        >
          <AText
            style={[
              s.pillTitle,
              {
                fontSize: pillFontSize,
                lineHeight: pillLineHeight,
              },
            ]}
            accessible
            accessibilityRole="header"
            accessibilityLabel="Últimas Acciones"
          >
            Últimas Acciones
          </AText>
        </AView>

        <View style={s.pillSeparator} />
      </View>
    );
  }

  const stickyIndices = SHOW_PILL ? [0] : [];

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <AppBar
        variant="section"
        title="Historial de Actividad"
        showBorder={false}
      />

      {loadingInitial ? (
        <View style={s.loaderWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <AFlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: Math.max(insets.bottom, theme.spacing.xl),
            paddingTop: 6,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={ListEmpty}
          ListHeaderComponent={ListHeader}
          stickyHeaderIndices={stickyIndices}
          ItemSeparatorComponent={() => <View style={s.itemSeparator} />}
          removeClippedSubviews={true}
          initialNumToRender={8}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
      )}
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const mkStyles = (theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },

    /* Header wrapper: fondo igual al background para que no se vea contenido "por debajo" */
    headerWrap: {
      backgroundColor: theme.colors.background,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xs,
      zIndex: 30,
    },

    /* Pill: reducido y menos pesado visualmente */
    pillContainer: {
      alignSelf: "center",
      width: "74%", // menos ancho para que no domine la pantalla
      borderRadius: theme.radius.xl,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow,
      ...(Platform.OS === "android" ? { elevation: 4 } : null),
    },
    pillTitle: {
      fontWeight: "700", // menos pesado que 900
      color: theme.colors.text,
      textAlign: "center",
    },

    /* separador debajo del pill para respirar */
    pillSeparator: {
      height: theme.spacing.md / 1.2,
    },

    /* Loader / empty */
    loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.lg,
    },
    emptyTitle: {
      fontSize: theme.font.h3,
      fontWeight: "700",
      color: theme.colors.textMuted,
      marginBottom: 6,
    },
    emptyHint: { color: theme.colors.textMuted, textAlign: "center" },

    /* Separador entre items */
    itemSeparator: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md / 2,
      marginHorizontal: theme.spacing.lg / 2,
      opacity: 0.6,
    },
  });
