import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function CajaGanancia() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const hoy = new Date();
  const [modo, setModo] = useState("mes");
  const [dia, setDia] = useState(hoy.toISOString().split("T")[0]);
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [año, setAño] = useState(hoy.getFullYear());

  const [lavanderia, setLavanderia] = useState([]);
  const [vending, setVending] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [expandido, setExpandido] = useState({}); // { [id]: detalle[] }

  async function buscar() {
    setCargando(true);

    let desde, hasta;
    if (modo === "dia") {
      desde = dia;
      hasta = dia;
    } else if (modo === "semana") {
      const fecha = new Date(dia);
      const diaSemana = fecha.getDay() === 0 ? 6 : fecha.getDay() - 1; // lunes=0
      const lunes = new Date(fecha);
      lunes.setDate(fecha.getDate() - diaSemana);
      const domingo = new Date(lunes);
      domingo.setDate(lunes.getDate() + 6);
      desde = lunes.toISOString().split("T")[0];
      hasta = domingo.toISOString().split("T")[0];
    } else if (modo === "mes") {
      desde = `${año}-${String(mes).padStart(2, "0")}-01`;
      const ultimoDia = new Date(año, mes, 0).getDate();
      hasta = `${año}-${String(mes).padStart(2, "0")}-${ultimoDia}`;
    } else {
      desde = `${año}-01-01`;
      hasta = `${año}-12-31`;
    }

    const [resLav, resVen] = await Promise.all([
      fetch(
        `${import.meta.env.VITE_API_URL}/ganancia?tipo=lavanderia&desde=${desde}&hasta=${hasta}`,
        {
          headers: { Authorization: "Bearer " + token },
        },
      ).then((r) => r.json()),
      fetch(
        `${import.meta.env.VITE_API_URL}/ganancia?tipo=vending&desde=${desde}&hasta=${hasta}`,
        {
          headers: { Authorization: "Bearer " + token },
        },
      ).then((r) => r.json()),
    ]);

    setLavanderia(Array.isArray(resLav) ? resLav : []);
    setVending(Array.isArray(resVen) ? resVen : []);
    setExpandido({});
    setCargando(false);
  }

  useEffect(() => {
    buscar();
  }, []);

  async function toggleDetalle(id) {
    if (expandido[id]) {
      setExpandido((prev) => ({ ...prev, [id]: null }));
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/ganancia/${id}`, {
      headers: { Authorization: "Bearer " + token },
    }).then((r) => r.json());

    setExpandido((prev) => ({ ...prev, [id]: res.detalle }));
  }

  async function retirarDenominacion(gananciaId, denominacion) {
    if (
      !confirm(
        `¿Retirar todas las monedas/billetes de ${denominacion < 1 ? (denominacion * 100).toFixed(0) + "c" : denominacion + "€"}?`,
      )
    )
      return;

    await fetch(
      `${import.meta.env.VITE_API_URL}/ganancia/${gananciaId}/retirar-denominacion`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ denominacion }),
      },
    );

    // Recargar detalle de ese día
    const res = await fetch(`${import.meta.env.VITE_API_URL}/ganancia/${gananciaId}`, {
      headers: { Authorization: "Bearer " + token },
    }).then((r) => r.json());

    setExpandido((prev) => ({ ...prev, [gananciaId]: res.detalle }));
    buscar();
  }

  const totalLav = lavanderia.reduce((a, g) => a + g.total, 0);
  const totalVen = vending.reduce((a, g) => a + g.total, 0);

  function formatDen(d) {
    return d < 1 ? `${(d * 100).toFixed(0)}c` : `${d}€`;
  }

  function renderTabla(datos, titulo, emoji) {
    const total = datos.reduce((a, g) => a + g.total, 0);
    const totalMonedas = datos.reduce(
      (a, g) => a + (g.total_retirado_monedas || 0),
      0,
    );
    const totalBilletes = datos.reduce(
      (a, g) => a + (g.total_retirado_billetes || 0),
      0,
    );

    return (
      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-header fw-semibold">
            {emoji} {titulo}
          </div>
          <div className="card-body p-0">
            {datos.length === 0 ? (
              <p className="text-muted p-3">No hay registros en ese período.</p>
            ) : (
              <>
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th className="text-end">Disponible</th>
                      <th className="text-end">Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.map((g) => (
                      <>
                        <tr key={g.id}>
                          <td>{g.fecha.split("-").reverse().join("/")}</td>
                          <td className="text-end fw-semibold">
                            {g.total.toFixed(2)} €
                          </td>
                          <td className="text-end">
                            {g.retirado ? (
                              <span className="badge bg-secondary">
                                Retirado
                              </span>
                            ) : (
                              <span className="badge bg-success">
                                Disponible
                              </span>
                            )}
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => toggleDetalle(g.id)}
                            >
                              {expandido[g.id] ? "Ocultar" : "Ver"}
                            </button>
                          </td>
                        </tr>

                        {expandido[g.id] && (
                          <tr key={`det-${g.id}`}>
                            <td colSpan={4} className="p-0 bg-light">
                              <table className="table table-sm mb-0">
                                <thead>
                                  <tr className="text-muted small">
                                    <th className="ps-4">Denominación</th>
                                    <th className="text-end">Cantidad</th>
                                    <th className="text-end">Subtotal</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {expandido[g.id]
                                    .filter((d) => d.cantidad > 0)
                                    .map((d) => (
                                      <tr key={d.denominacion}>
                                        <td className="ps-4">
                                          {formatDen(d.denominacion)}
                                        </td>
                                        <td className="text-end">
                                          {d.cantidad}
                                        </td>
                                        <td className="text-end fw-semibold">
                                          {d.subtotal.toFixed(2)} €
                                        </td>
                                        <td className="text-end pe-3">
                                          <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() =>
                                              retirarDenominacion(
                                                g.id,
                                                d.denominacion,
                                              )
                                            }
                                          >
                                            Retirar
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  {expandido[g.id].filter((d) => d.cantidad > 0)
                                    .length === 0 && (
                                    <tr>
                                      <td
                                        colSpan={4}
                                        className="text-muted ps-4 py-2"
                                      >
                                        Todo retirado
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th>Disponible</th>
                      <th className="text-end text-success">
                        {total.toFixed(2)} €
                      </th>
                      <th colSpan={2}></th>
                    </tr>
                  </tfoot>
                </table>

                {/* Tabla retirado */}
                {(totalMonedas > 0 || totalBilletes > 0) && (
                  <div className="border-top">
                    <table className="table table-sm mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="ps-3 text-muted small">Retirado</th>
                          <th className="text-end text-muted small">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="ps-3">🪙 Monedas (≤ 2€)</td>
                          <td className="text-end fw-semibold">
                            {totalMonedas.toFixed(2)} €
                          </td>
                        </tr>
                        <tr>
                          <td className="ps-3">💵 Billetes (≥ 5€)</td>
                          <td className="text-end fw-semibold">
                            {totalBilletes.toFixed(2)} €
                          </td>
                        </tr>
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <th className="ps-3">Total retirado</th>
                          <th className="text-end text-danger">
                            {(totalMonedas + totalBilletes).toFixed(2)} €
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate("/caja")}
      >
        ← Volver
      </button>
      <h2 className="mb-4">Ganancia</h2>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Ver por</label>
              <select
                className="form-select"
                value={modo}
                onChange={(e) => setModo(e.target.value)}
              >
                <option value="dia">Día</option>
                <option value="semana">Semana</option>
                <option value="mes">Mes</option>
                <option value="año">Año</option>
              </select>
            </div>

            {modo === "dia" && (
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  value={dia}
                  onChange={(e) => setDia(e.target.value)}
                />
              </div>
            )}

            {modo === "semana" && (
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Semana del
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={dia}
                  onChange={(e) => setDia(e.target.value)}
                />
                <div className="form-text">
                  Se mostrará la semana completa de esa fecha (lunes a domingo)
                </div>
              </div>
            )}

            {modo === "mes" && (
              <>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Mes</label>
                  <select
                    className="form-select"
                    value={mes}
                    onChange={(e) => setMes(Number(e.target.value))}
                  >
                    {MESES.map((m, i) => (
                      <option key={i} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Año</label>
                  <input
                    type="number"
                    className="form-control"
                    value={año}
                    onChange={(e) => setAño(Number(e.target.value))}
                  />
                </div>
              </>
            )}

            {modo === "año" && (
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Año</label>
                <input
                  type="number"
                  className="form-control"
                  value={año}
                  onChange={(e) => setAño(Number(e.target.value))}
                />
              </div>
            )}

            <div className="col-md-2">
              <button
                className="btn btn-primary w-100"
                onClick={buscar}
                disabled={cargando}
              >
                {cargando ? "..." : "Buscar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <div className="text-muted small">Lavandería</div>
              <div className="fs-4 fw-bold">{totalLav.toFixed(2)} €</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <div className="text-muted small">Vending</div>
              <div className="fs-4 fw-bold">{totalVen.toFixed(2)} €</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <div className="text-muted small">Total</div>
              <div className="fs-4 fw-bold text-success">
                {(totalLav + totalVen).toFixed(2)} €
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablas */}
      {cargando ? (
        <p className="text-muted">Cargando...</p>
      ) : (
        <div className="row g-4">
          {renderTabla(lavanderia, "Lavandería", "🧺")}
          {renderTabla(vending, "Vending", "🥤")}
        </div>
      )}
    </div>
  );
}
