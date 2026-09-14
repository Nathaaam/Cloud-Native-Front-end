import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Fondos from "./pages/Fondos";
import NuevaInversion from "./pages/NuevaInversion";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";

function AppContent() {
  const { usuario, logout, esAdmin } = useAuth();
  const [registro, setRegistro] = useState(false);
  const [pagina, setPagina] = useState("dashboard");

  // Pantallas de Login / Registro
  if (!usuario) {
    if (registro) {
      return <Register volver={() => setRegistro(false)} />;
    }

    return (
      <Login
        onLogin={() => setRegistro(false)}
        irRegistro={() => setRegistro(true)}
      />
    );
  }

  // Aplicación Banco Cloud
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          Banco <span>Cloud</span>
        </div>

        <nav>
          <button
            className={pagina === "dashboard" ? "active" : ""}
            onClick={() => setPagina("dashboard")}
          >
            🏠 Dashboard
          </button>

          <button
            className={pagina === "fondos" ? "active" : ""}
            onClick={() => setPagina("fondos")}
          >
            📈 Mi Portafolio
          </button>

          <button
            className={pagina === "invertir" ? "active" : ""}
            onClick={() => setPagina("invertir")}
          >
            💰 Nueva inversión
          </button>

          {esAdmin() && (
            <button
              className={pagina === "admin" ? "active" : ""}
              onClick={() => setPagina("admin")}
            >
              ⚙️ Administración
            </button>
          )}
        </nav>

        <div className="sidebar-user">
          <div className="avatar">
            {usuario?.nombre?.charAt(0)}
            {usuario?.apellido?.charAt(0)}
          </div>

          <div>
            <strong>
              {usuario?.nombre} {usuario?.apellido}
            </strong>
            <span>{esAdmin() ? "Administrador" : "Cliente"}</span>
          </div>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <strong>Banco Cloud</strong>

          <div>
            Hola {usuario?.nombre} 👋
            <button
              onClick={() => {
                logout();
                setPagina("dashboard");
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {pagina === "dashboard" && <Dashboard />}

        {pagina === "fondos" && (
          <Fondos irAInvertir={() => setPagina("invertir")} />
        )}

        {pagina === "invertir" && <NuevaInversion />}

        {pagina === "admin" && esAdmin() && <Admin />}
      </section>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;