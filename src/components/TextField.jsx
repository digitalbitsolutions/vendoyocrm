import React, { useMemo, useState } from "react";                           
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../style/theme";                                  

export function TextField({
  label,
  error,
  style,
  onBlur,
  secureTextEntry,
  leftIcon = null,                                                          
  rightIcon = null,                                                     
  helperText,                                                       
  ...inputProps // value, onChangeText, placeholder, keyboardType, etc.
}) {
  const { theme } = useTheme();                                             
  const s = useMemo(() => mkStyles(theme), [theme]);                    

  const [focused, setFocused] = useState(false);
  const isPassword = !!secureTextEntry;
  const [isSecure, setIsSecure] = useState(isPassword);

  const placeholderColor = theme.colors.textMuted || "#6B7280";            

  return (
    <View style={[s.wrap, style]}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      
      <View style={s.inputWrap}>
        {/* Icono izquierdo (si lo pasas) */}
        {leftIcon ? <View style={s.leftIcon}>{leftIcon}</View> : null}      

        <TextInput
          style={[
            s.input,
            isPassword && s.inputWithRightIcon,
            !!leftIcon && s.inputWithLeftIcon,                              
            focused && s.inputFocused,
            !!error && s.inputError,
          ]}
          placeholderTextColor={placeholderColor}                           
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          {...inputProps}
          secureTextEntry={isPassword ? isSecure : false}
        />

        {/* Ojo (toggle) si es password, si no, muestra rightIcon si te lo pasan */}
        {isPassword ? (
          <Pressable
            onPress={() => setIsSecure((v) => !v)}
            style={s.rightBtn}
            hitSlop={theme.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={isSecure ? "Mostrar contraseña" : "Ocultar contraseña"}
          >
            <Ionicons
              name={isSecure ? "eye" : "eye-off"}
              size={20}
              color={focused ? theme.colors.secondary : (theme.colors.textMuted || "#6B7280")}
            />
          </Pressable>
        ) : (
          rightIcon ? <View style={s.rightIcon}>{rightIcon}</View> : null    
        )}
      </View>

      {/* helperText (si no hay error) o error */}
      {error
        ? <Text style={s.error}>{String(error)}</Text>
        : helperText ? <Text style={s.helper}>{helperText}</Text> : null}   
    </View>
  );
}

/* ---------- Estilos dependientes del tema ---------- */
const mkStyles = (theme) => StyleSheet.create({
  wrap: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  inputWrap: {
    position: "relative",
    justifyContent: "center",                                              
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surface,
    fontSize: 16,
    color: theme.colors.text,
  },

  // Ajustes por iconos
  inputWithRightIcon: { paddingRight: 44 },                                
  inputWithLeftIcon: { paddingLeft: 44 },                                  

  // Estados
  inputFocused: {
    borderColor: theme.colors.secondary,
  },
  inputError: {
    borderColor: theme.colors.error,
  },

  // Icono derecho (ojito o rightIcon)
  rightBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    marginTop: -10,
    height: 20,
    width: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  rightIcon: {                                                             
    position: "absolute",
    right: 12,
    top: "50%",
    marginTop: -10,
  },

  // Icono izquierdo
  leftIcon: {                                                                
    position: "absolute",
    left: 12,
    top: "50%",
    marginTop: -10,
  },

  // Mensajes
  error: {
    marginTop: 6,
    color: theme.colors.error,
    fontSize: 13,
  },
  helper: {                                                                  
    marginTop: 6,
    color: theme.colors.textMuted,
    fontSize: 13,
  },
});
