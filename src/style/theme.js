export const theme = {
    // 1. Colores de marca y de UI
    colors: {
        primary:   "#FF3333",   // Rojo: avisos, error, estados criticos
        secondary: "#0066CC",   // Azul: acciones, títulos, links
        accent:    "#FFD600",   // Amarillo: CTA principal y acentos
        success:   "#2E7D32",   // Verde: estados OK
        warning:   "#FFB020",   // Amarillo/naranja: para warnings suaves

        background: "#FAFAFA",  // Fondo general
        surface:    "#FFFFFF",  // Tarjetas / inputs / contenedores
        border:     "#E5E7EB",  // Líneas y bordes suaves

        text:      "#111827",   // Texto principal (gris muy oscuro)
        textMuted: "#6B7280",   // Texto secundario/placeholder
        overlay:   "rgba(0,0,0,0.4)", // Capa semitransparente (modales, loaders)

        muted:       "#6B7280",   // alias para placeholderTextColor
        error:       "#FF3333",   // alias para errores (coincide con primary)
        onAccent:    "#111827",   // texto sobre botones amarillos
        onSecondary: "#FFFFFF",   // texto sobre botones azules
    },

    // 2. Escala de espacios (margen/padding)
    spacing: {
        xs: 6,
        sm: 10,
        md: 14,
        lg: 20,
        xl: 28,
        xxl: 36,
    },

    // 3. Curvas (redondeo de bordes)
    radius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 22,
        pill: 999, //Botones pastilla (totalmente redondos a los lados)
    },

    // 4. Tipografías (tamaños base)
    font: {
        h1: 28,
        h2: 24,
        h3: 20,
        body: 16,
        small: 14,
        tiny: 12,
    },

    // 5. Sombra coherente en iOS y Android
    shadow: {
        // iOS
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        // Android
        elevation: 6,
    },

    // 6. Z-index estándar (para ordenar capas)
    zIndex: {
        base: 1,
        header: 10,
        modal: 100,
        toast: 1000,
    },

    // 7. Opacidades útiles
    opacity: {
        disabled: 0.5,   // elementos desactivados
        pressed: 0.7,   // feedback visual al presionar
    },

    // 8. Helper de áres táctil extra (mejora usabilidad)
    hitSlop: { 
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
    },
};