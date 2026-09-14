import "./Dashboard.css";

function Dashboard() {
  return (
    <main className="dashboard-page">

      <h1>
        Bienvenido a Banco Cloud
      </h1>

      <p className="subtitle">
        Consulta el estado de tus productos financieros.
      </p>


      <section className="dashboard-cards">

        <div className="dashboard-card">
          <span>
            Saldo disponible
          </span>

          <strong>
            $4.250.000
          </strong>

          <small>
            Cuenta corriente
          </small>
        </div>


        <div className="dashboard-card">
          <span>
            Total invertido
          </span>

          <strong>
            $6.800.000
          </strong>

          <small className="positive">
            +8,4% este año
          </small>
        </div>


        <div className="dashboard-card">
          <span>
            Fondos activos
          </span>

          <strong>
            3
          </strong>

          <small>
            Inversiones vigentes
          </small>
        </div>

      </section>


    </main>
  );
}

export default Dashboard;