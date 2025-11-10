import React from "react";                                                
import { Pressable, Text, StyleSheet, Platform, View, ActivityIndicator } from "react-native"; 
import { useTheme } from "../style/theme";                                 

export function Button({
  title,
  onPress,
  disabled = false,                                                       
  loading = false,                                            
  variant = "primary",
  fullWidth = false,                                                
  leftIcon = null,                                                        
  rightIcon = null,                                                     
}) {
  const { theme } = useTheme();                                           
  const s = mkStyles(theme);                                              

  
  const textColor =
    variant === "primary" ? theme.colors.onAccent :
    variant === "secondary" ? theme.colors.onSecondary :
    variant === "danger" ? theme.colors.onSecondary :                     
    theme.colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{ borderless: false }}
      style={({ pressed }) => [
        s.base,
        s[variant],                                                       
        fullWidth && { alignSelf: "stretch" },                            
        (disabled || loading) && s.disabled,
        pressed && { opacity: theme.opacity.pressed },
      ]}
      hitSlop={theme.hitSlop}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }} 
    >
      {/* Contenido del botón en fila */}
      <View style={s.content}>                                           
        {/* Izquierda: spinner o icono */}
        {loading ? (
          <ActivityIndicator size="small" color={textColor} style={{ marginRight: 8 }} />  
        ) : (
          leftIcon ? <View style={{ marginRight: 8 }}>{leftIcon}</View> : null             
        )}

        {/* Texto */}
        <Text style={[s.text, { color: textColor }]} numberOfLines={1}>
          {loading ? "Cargando..." : title}                               
        </Text>

        {/* Icono derecho */}
        {rightIcon ? <View style={{ marginLeft: 8 }}>{rightIcon}</View> : null}            
      </View>
    </Pressable>
  );
}


const mkStyles = (theme) =>
  StyleSheet.create({
    base: {
      height: 52,
      borderRadius: theme.radius.pill,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      ...theme.shadow,
      ...(Platform.OS === "android" ? { overflow: "hidden" } : null),
      backgroundColor: theme.colors.surface, // base neutra; variant define color final
    },

    // Variantes
    primary: { backgroundColor: theme.colors.accent },                    
    secondary: { backgroundColor: theme.colors.secondary },               
    danger: { backgroundColor: theme.colors.danger },                     
    outline: {                                                            
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    ghost: {                                                              
      backgroundColor: "transparent",
      shadowOpacity: 0, // sin sombra para ghost
    },

    disabled: { opacity: theme.opacity.disabled },

    text: {
      fontSize: theme.font.body,
      fontWeight: "700",
    },

    content: {                                                            
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 2,
      minWidth: 40,
    },
  });
