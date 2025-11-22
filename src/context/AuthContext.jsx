// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useState,
  useRef,
} from "react";

// login vendrá desde el conmutador central (mock / real)
import * as API from "../services/api";
// otros helpers de sesión (persistencia) siguen viniendo del servicio auth
import { logout, getSession } from "../services/auth";

// 1. Contexto
const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() debe usarse dentro de <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ref para evitar imprimir repetidamente el mismo mensaje en dev
  const _devLogged = useRef({});

  const devLog = useCallback((msg, once = false) => {
    // __DEV__ es la variable global de React Native (true en dev)
    if (typeof __DEV__ !== "undefined" && !__DEV__) return;
    if (once) {
      if (_devLogged.current[msg]) return;
      _devLogged.current[msg] = true;
    }
    // usamos console.debug para mensajes de desarrollo no intrusivos
    // (console.warn genera mucho ruido en algunos entornos)
    console.debug(msg);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        devLog("AuthProvider: cargando sesión...", true);

        const sess = await getSession();

        if (!isMounted) return;

        if (sess?.token) {
          setToken(sess.token);
          setUser(sess.user);
          devLog("AuthProvider: sesión encontrada.", true);
        } else {
          devLog("AuthProvider: sin sesión.", true);
        }
      } catch (error) {
        // mostramos errores con console.error (permitido por ESLint config)
        console.error("Error al cargar la sesión:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          devLog("AuthProvider: carga de sesión finalizada.", true);
        }
      }
    };

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [devLog]);

  // -----------------------
  // Callbacks para acciones
  // -----------------------
  const signIn = useCallback(async ({ email, password, remember = false }) => {
    try {
      // delegamos en API.login (puede ser mock o real)
      const sess = await API.login({ email, password, remember });

      // guardamos estado local
      setToken(sess?.token ?? null);
      setUser(sess?.user ?? null);

      return sess;
    } catch (err) {
      console.error("AuthProvider.signIn error:", err);
      throw err;
    }
  }, []);

  const signUp = useCallback(async ({ name, email, password }) => {
    // deja la excepción explícita: el recruiter sabe que falta implementar
    throw new Error("signUp no implementado en este snippet");
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logout();
      setToken(null);
      setUser(null);
    } catch (err) {
      console.error("AuthProvider.signOut error:", err);
      throw err;
    }
  }, []);

  const reloadSession = useCallback(async () => {
    try {
      const sess = await getSession();
      setToken(sess?.token ?? null);
      setUser(sess?.user ?? null);
    } catch (err) {
      // aquí usamos warn porque no es crítico
      console.warn("AuthProvider.reloadSession:", err);
    }
  }, []);

  const actions = useMemo(
    () => ({
      signIn,
      signUp,
      signOut,
      reloadSession,
    }),
    [signIn, signUp, signOut, reloadSession]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      isLoading,
      ...actions,
    }),
    [user, token, isLoading, actions]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
