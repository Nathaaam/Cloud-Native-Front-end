import { useState } from "react";
import "./NuevaInversion.css";


function NuevaInversion() {

  const [monto, setMonto] = useState("");


  return (

    <main className="investment-page">

      <h1>
        Nueva inversión
      </h1>

      <p>
        Invierte tu dinero en fondos mutuos disponibles.
      </p>


      <section className="investment-form">


        <label>
          Seleccionar fondo
        </label>


        <select>

          <option>
            Fondo Conservador
          </option>

          <option>
            Fondo Balanceado
          </option>

          <option>
            Fondo Dinámico
          </option>

        </select>



        <label>
          Monto a invertir
        </label>


        <input
          type="number"
          placeholder="Ingrese monto"
          value={monto}
          onChange={(e)=>setMonto(e.target.value)}
        />



        <div className="summary">

          <h3>
            Resumen
          </h3>


          <p>
            Fondo: Fondo Conservador
          </p>


          <p>
            Monto:
            ${monto || "0"}
          </p>


        </div>



        <button>
          Confirmar inversión
        </button>


      </section>


    </main>

  );

}


export default NuevaInversion;