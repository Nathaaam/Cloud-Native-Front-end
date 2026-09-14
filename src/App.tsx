import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Fondos from "./pages/Fondos";
import NuevaInversion from "./pages/NuevaInversion";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { obtenerUsuario, cerrarSesion } from "./services/storageService";
import "./App.css";


function App() {

  const [logueado, setLogueado] = useState(
    obtenerUsuario() !== null
  );

  const [registro, setRegistro] = useState(false);

  const [pagina, setPagina] = useState("dashboard");


  const usuario = obtenerUsuario();

  // Pantallas de Login / Registro

  if (!logueado) {


    if (registro) {

      return (

        <Register
          volver={() => setRegistro(false)}
        />

      );

    }


    return (

      <Login

        onLogin={() => setLogueado(true)}

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

            📈 Mis Fondos

          </button>



          <button

            className={pagina === "invertir" ? "active" : ""}

            onClick={() => setPagina("invertir")}

          >

            💰 Nueva inversión

          </button>



          <button

            className={pagina === "admin" ? "active" : ""}

            onClick={() => setPagina("admin")}

          >

            ⚙ Administración

          </button>


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


          <span>

            Cliente Banco Cloud

          </span>


        </div>


      </div>


      </aside>




      <section className="main-content">


        <header className="topbar">


          <strong>

            Banco Cloud

          </strong>



          <div>

           Hola {usuario?.nombre} 👋


            <button

              onClick={() => {

                setLogueado(false);

                setPagina("dashboard");

              }}

            >

              Cerrar sesión

            </button>


          </div>


        </header>





        {
          pagina === "dashboard" &&

          <Dashboard />

        }





        {
          pagina === "fondos" &&

          <Fondos />

        }





        {
          pagina === "invertir" &&

          <NuevaInversion />

        }





        {
          pagina === "admin" &&

          <main className="placeholder-page">

            <h1>
              Administración
            </h1>


            <p>
              Gestión de fondos y usuarios.
            </p>


          </main>

        }



      </section>


    </div>

  );

}


export default App;