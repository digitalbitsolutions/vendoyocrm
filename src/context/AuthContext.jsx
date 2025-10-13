// ------------------------------------------------------------------------------------
// Contexto global de Autenticación para toda la app.
// - Restaura la sesión guardada al arrancar (token + user).
// - Expone estado (user, token, isAuthenticated, isLoading)
//   y acciones (signIn, signUp, signOut, reloadSession).
// - Oculta los detalles de almacenamiento y backend a las pantallas.
// ------------------------------------------------------------------------------------

import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

// Importamos únicamente la API pública del servicio de auth (sin UI)
import { login, register, logout, getSession } from "../services/auth";

// 1. Creamos el contexto (el "canal" para compartir auth)
const AuthContext = createContext(null);

// 2. Hook de conveniencia para consumir el contexto
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        // Esto ayuda a detectar usos fuera del provider
        throw new Error("useAuth() debe usarse dentro de <AuthProvider>");
    }
    return ctx;
}

// 3. Proveedor que envuelve a la app (lo pondremos en app/_layout.jsx)
export function AuthProvider({ children }) {
    // ----- Estado en memoria (vive mientras la app está abierta) -----
    const [user, setUser] = useState(null);          // objeto user (id, email, name. role...)
    const [token, setToken] = useState(null);        // string token (JWT o similar)
    const [booting, setBooting] = useState(true);    // true mientras restauramos sesión inicial

    // Al montar el provider: intentamos restaurar la sesión desde almacenamiento seguro
    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                // getSession() -> { token, user } | null (lo trae del storage seguro)
                const sess = await getSession();
                if (alive && sess?.token) {
                    setToken(sess.token);
                    setUser(sess.user);
                }
            } finally {
                if (alive) setBooting(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    // Acciones expuestas a toda la app (memorizadas para no re-crear funciones)
    const actions = useMemo(
        () => ({
            /** Iniciar sesión con email/password */
            async signIn({ email, password }) {
                const sess = await login({ email, password });   // guarda en storage dentro del servicio
                setToken(sess.token);
                setUser(sess.user);
                return sess;   // a veces la pantalla quiere leer user inmediatamente
            },

            /** Registro de usuario + deja sesión iniciada */
            async signUp({ name, email, password }) {
                const sess = await register({ name, email, password }).catch((e) => {
                    throw new Error(e?.message || "No se pudo registrar");
                });
                setToken(sess.token);
                setUser(sess.user);
                return sess;
            },

            /** Cerrar sesión global: borra storage y limpia estado */
            async signOut() {
                await logout();
                setToken(null);
                setUser(null);
            },

            /** Releer sesión desde storage (por si cambió desde fuera) */
            async reloadSession() {
                const sess = await getSession();
                setToken(sess?.token ?? null);
                setUser(sess?.user ?? null);
            },
        }),
        []
    );

    // Objeto de valor que veraán los componentes que hagan useAuth()
    const value = useMemo(
        () => ({
            // Estado
            user,
            token,
            isAuthenticated: !!token,   // bool: hay token
            isLoading: booting,         // bool: estamos bootstrapping

            // Acciones
            ...actions,
        }),
        [user, token, booting, actions]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}