import { createContext, useState, useContext, useEffect } from "react";
import * as apiService from "../services/apiService";

interface User {
  id?: number;
  nombre: string;
  apellido: string;
  correo?: string;
  email?: string;
  rol?: string;
  password?: string;
}

interface AuthContextType {
  usuario: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registrar: (userData: any) => Promise<void>;
  esAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Cargar sesión al iniciar
  useEffect(() => {
    const tokenGuardado = localStorage.getItem("authToken");
    const usuarioGuardado = localStorage.getItem("usuario");
    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (e) {
        console.error("Error parsing usuario", e);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await apiService.login(email, password);
      
      const nuevoToken = data.token || data.jwtToken;
      
      // Guardar token
      setToken(nuevoToken);
      localStorage.setItem("authToken", nuevoToken);

      // Guardar datos del usuario
      const usuarioData: User = {
        id: data.id || data.usuarioId,
        nombre: data.nombre || "Usuario",
        apellido: data.apellido || "",
        correo: email,
        email: email,
        rol: data.rol || data.role || "CLIENTE",
      };
      
      setUsuario(usuarioData);
      localStorage.setItem("usuario", JSON.stringify(usuarioData));
    } catch (error: any) {
      console.error("Error en login:", error);
      throw new Error(error.message || "Error en la autenticación");
    }
  };

  const registrar = async (userData: any) => {
    try {
      const response = await fetch(
        "http://localhost:8090/api/v1/auth/registro",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: userData.nombre,
            apellido: userData.apellido,
            email: userData.correo,
            password: userData.password,
            passwordConfirm: userData.passwordConfirm || userData.password,
            rol: userData.rol || "CLIENTE",
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error en registro");
      }

      const data = await response.json();
      
      // Guardar token del login automático
      const nuevoToken = data.token || data.jwtToken;
      setToken(nuevoToken);
      localStorage.setItem("authToken", nuevoToken);

      // Guardar datos del usuario
      const usuarioData: User = {
        id: data.id || data.usuarioId,
        nombre: userData.nombre,
        apellido: userData.apellido,
        correo: userData.correo,
        email: userData.correo,
        rol: data.rol || userData.rol || "CLIENTE",
      };
      
      setUsuario(usuarioData);
      localStorage.setItem("usuario", JSON.stringify(usuarioData));
    } catch (error: any) {
      console.error("Error en registro:", error);
      throw new Error(error.message || "Error en el registro");
    }
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("usuario");
  };

  const esAdmin = () => {
    if (!usuario) return false;
    const rol = usuario.rol || "";
    return rol.includes("ADMIN");
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, registrar, esAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}

