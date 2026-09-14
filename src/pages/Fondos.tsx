import "./Fondos.css";

function Fondos() {
  const fondos = [
    {
      nombre: "Fondo Conservador",
      tipo: "Bajo riesgo",
      rentabilidad: "+4,2%",
      monto: "$1.250.000",
    },
    {
      nombre: "Fondo Balanceado",
      tipo: "Riesgo medio",
      rentabilidad: "+7,8%",
      monto: "$2.430.000",
    },
    {
      nombre: "Fondo Dinámico",
      tipo: "Alto riesgo",
      rentabilidad: "+11,5%",
      monto: "$3.120.000",
    },
  ];

  return (
    <main className="fondos-page">
      <div className="fondos-header">
        <div>
          <h1>Mis Fondos</h1>
          <p>Administra y revisa tus inversiones</p>
        </div>

        <button className="btn-primary">
          + Nueva inversión
        </button>
      </div>

      <section className="fondos-summary">
        <div className="summary-card">
          <span>Total invertido</span>
          <strong>$6.800.000</strong>
        </div>

        <div className="summary-card">
          <span>Rentabilidad</span>
          <strong className="positive">+8,4%</strong>
        </div>

        <div className="summary-card">
          <span>Fondos activos</span>
          <strong>3</strong>
        </div>
      </section>

      <section className="fondos-list">
        <h2>Mis inversiones</h2>

        <div className="fondos-grid">
          {fondos.map((fondo) => (
            <article className="fondo-card" key={fondo.nombre}>
              <div className="fondo-top">
                <div className="fondo-icon">📈</div>

                <span className="fondo-risk">
                  {fondo.tipo}
                </span>
              </div>

              <h3>{fondo.nombre}</h3>

              <div className="fondo-info">
                <div>
                  <span>Monto invertido</span>
                  <strong>{fondo.monto}</strong>
                </div>

                <div>
                  <span>Rentabilidad</span>
                  <strong className="positive">
                    {fondo.rentabilidad}
                  </strong>
                </div>
              </div>

              <button className="btn-secondary">
                Ver detalles
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Fondos;