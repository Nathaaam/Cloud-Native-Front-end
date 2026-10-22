import {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";

import {
  signIn,
  signUp,
  confirmSignUp,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";

interface User {
  id?: number;
  nombre: string;
  apellido: string;
  correo?: string;
  email?: string;
  rol?: string;
}

interface AuthContextType {
  usuario: User | null;
  token: string | null;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  registrar: (userData: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
  }) => Promise<void>;

  confirmarRegistro: (
    email: string,
    codigo: string,
    nombre: string,
    apellido: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;

  esAdmin: () => boolean;
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8090/api/v1";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [usuario, setUsuario] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  async function obtenerAccessToken() {
    const session =
      await fetchAuthSession();

    return (
      session.tokens?.accessToken?.toString() ||
      null
    );
  }

  async function cargarPerfil(
    accessToken: string
  ) {
    try {
      const response = await fetch(
        `${API_URL}/usuarios/me`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        setUsuario(null);
        setToken(null);
        return false;
      }

      const data =
        await response.json();

      setUsuario({
        id: data.id,
        nombre:
          data.nombre || "Usuario",
        apellido:
          data.apellido || "",
        correo: data.email,
        email: data.email,
        rol:
          data.rol || "CLIENTE",
      });

      setToken(accessToken);

      return true;

    } catch (error) {
      console.error(
        "Error obteniendo perfil:",
        error
      );

      setUsuario(null);
      setToken(null);

      return false;
    }
  }

  async function registrarEnBancoCloud(
    accessToken: string,
    nombre: string,
    apellido: string,
    email: string
  ) {
    const response = await fetch(
      `${API_URL}/usuarios/registro`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          nombre,
          apellido,
          email,
        }),
      }
    );

    if (!response.ok) {
      const errorData =
        await response
          .json()
          .catch(() => null);

      throw new Error(
        errorData?.message ||
          "No se pudo registrar el usuario en BancoCloud"
      );
    }

    return await response.json();
  }

  async function login(
    email: string,
    password: string
  ) {
    const result = await signIn({
      username: email,
      password,
    });

    if (!result.isSignedIn) {
      throw new Error(
        "La autenticación requiere un paso adicional."
      );
    }

    const accessToken =
      await obtenerAccessToken();

    if (!accessToken) {
      await signOut();

      throw new Error(
        "Cognito no devolvió un Access Token."
      );
    }

    const perfilCargado =
      await cargarPerfil(accessToken);

    if (!perfilCargado) {
      /*
       * Si existe en Cognito pero no existe
       * en BancoCloud, cerramos también la
       * sesión de Cognito.
       */
      await signOut();

      throw new Error(
        "El usuario está autenticado en Cognito, pero no está registrado en BancoCloud."
      );
    }
  }

  async function registrar({
    nombre,
    apellido,
    email,
    password,
  }: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
  }) {
    const result = await signUp({
      username: email,
      password,

      options: {
        userAttributes: {
          email,
        },
      },
    });

    if (result.isSignUpComplete) {
      await finalizarRegistro(
        email,
        nombre,
        apellido,
        password
      );
    }
  }

  async function confirmarRegistro(
    email: string,
    codigo: string,
    nombre: string,
    apellido: string,
    password: string
  ) {
    await confirmSignUp({
      username: email,
      confirmationCode: codigo,
    });

    await finalizarRegistro(
      email,
      nombre,
      apellido,
      password
    );
  }

  async function finalizarRegistro(
    email: string,
    nombre: string,
    apellido: string,
    password: string
  ) {
    const result = await signIn({
      username: email,
      password,
    });

    if (!result.isSignedIn) {
      throw new Error(
        "No se pudo iniciar sesión después de confirmar la cuenta."
      );
    }

    const accessToken =
      await obtenerAccessToken();

    if (!accessToken) {
      throw new Error(
        "Cognito no devolvió un Access Token."
      );
    }

    const data =
      await registrarEnBancoCloud(
        accessToken,
        nombre,
        apellido,
        email
      );

    setUsuario({
      id: data.id,
      nombre:
        data.nombre || nombre,
      apellido:
        data.apellido || apellido,
      correo: data.email,
      email: data.email,
      rol:
        data.rol || "CLIENTE",
    });

    setToken(accessToken);
  }

  async function logout() {
    try {
      await signOut();
    } finally {
      setUsuario(null);
      setToken(null);
    }
  }

  async function restaurarSesion() {
    try {
      await getCurrentUser();

      const accessToken =
        await obtenerAccessToken();

      if (!accessToken) {
        setUsuario(null);
        setToken(null);
        return;
      }

      const perfilCargado =
        await cargarPerfil(
          accessToken
        );

      if (!perfilCargado) {
        await signOut();
      }

    } catch {
      setUsuario(null);
      setToken(null);
    }
  }

  useEffect(() => {
    restaurarSesion();
  }, []);

  const esAdmin = () => {
    return (
      usuario?.rol?.includes(
        "ADMIN"
      ) ?? false
    );
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        registrar,
        confirmarRegistro,
        logout,
        esAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe usarse dentro de AuthProvider"
    );
  }

  return context;
}