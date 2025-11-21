// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// login vendrá desde el conmutador central (mock / real)
import * as API from "../services/api";
// otros helpers de sesión (persistencia) siguen viniendo del servicio auth
import { loginWithToken, logout, getSession } from "../services/auth";

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
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadSession = async () => {
      try {
        console.log("Cargando sesión...");
        const sess = await getSession();
        console.log("Sesión cargada:", sess ? "Sesión encontrada" : "Sin sesión");
        
        if (!isMounted) return;
        
        if (sess?.token) {
          setToken(sess.token);
          setUser(sess.user);
        }
      } catch (error) {
        console.error("Error al cargar la sesión:", error);
      } finally {
        if (isMounted) {
          console.log("Finalizando carga de sesión");
          setBooting(false);
        }
      }
    };
    
    loadSession();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const actions = useMemo(() => ({
    /** Inicio clásico con email/password */
    async signIn({ email, password, remember = false }) {
      // ahora usamos API.login que delega a mocks o al cliente real
      const sess = await API.login({ email, password, remember });
      setToken(sess.token);
      setUser(sess.user);
      return sess;
    },


    /** Registro — si lo necesitas implementa register() en services/auth */
    async signUp({ name, email, password }) {
      throw new Error("signUp no implementado en este snippet");
    },

    /** Cerrar sesión global */
    async signOut() {
      await logout();
      setToken(null);
      setUser(null);
    },

    /** Releer sesión desde storage (por si cambió desde fuera) */
    async reloadSession() {
      try {
        const sess = await getSession();
        setToken(sess?.token ?? null);
        setUser(sess?.user ?? null);
      } catch (e) {
        console.warn("reloadSession:", e);
      }
    },

  }), []);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!token,
    isLoading: booting,
    ...actions
  }), [user, token, booting, actions]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
