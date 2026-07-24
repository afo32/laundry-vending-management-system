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

const DENOMINACIONES = [0.05, 0.1, 0.2, 0.5, 1, 2];

export default function CajaCambio() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const hoy = new Date();
  const hoyStr = hoy.toISOString().split("T")[0];

  const [modo, setModo] = useState("mes");
  const [dia, setDia] = useState(hoyStr);
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [año, setAño] = useState(hoy.getFullYear());

  const [cambio, setCambio] = useState(0);
  const [diferencia, setDiferencia] = useState(0);
  const [urgentes, setUrgentes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [denominacion, setDenominacion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [fechaForm, setFechaForm] = useState(hoyStr);
  const [guardando, setGuardando] = useState(false);

  function calcularRango() {
    if (modo === "dia") return { desde: dia, hasta: dia };
    if (modo === "semana") {
      const fecha = new Date(dia);
      const diaSemana = fecha.getDay() === 0 ? 6 : fecha.getDay() - 1;
      const lunes = new Date(fecha);
      lunes.setDate(fecha.getDate() - diaSemana);
      const domingo = new Date(lunes);
      domingo.setDate(lunes.getDate() + 6);
      return {
        desde: lunes.toISOString().split("T")[0],
        hasta: domingo.toISOString().split("T")[0],
      };
    }
    if (modo === "mes") {
      const desde = `${año}-${String(mes).padStart(2, "0")}-01`;
      const ultimoDia = new Date(año, mes, 0).getDate();
      const hasta = `${año}-${String(mes).padStart(2, "0")}-${ultimoDia}`;
      return { desde, hasta };
    }
    return { desde: `${año}-01-01`, hasta: `${año}-12-31` };
  }

  async function cargar(modoActual, diaActual, mesActual, añoActual) {
    setCargando(true);

    let desde, hasta;
    if (modoActual === "dia") {
      desde = diaActual;
      hasta = diaActual;
    } else if (modoActual === "semana") {
      const fecha = new Date(diaActual);
      const diaSemana = fecha.getDay() === 0 ? 6 : fecha.getDay() - 1;
      const lunes = new Date(fecha);
      lunes.setDate(fecha.getDate() - diaSemana);
      const domingo = new Date(lunes);
      domingo.setDate(lunes.getDate() + 6);
      desde = lunes.toISOString().split("T")[0];
      hasta = domingo.toISOString().split("T")[0];
    } else if (modoActual === "mes") {
      desde = `${añoActual}-${String(mesActual).padStart(2, "0")}-01`;
      const ultimoDia = new Date(añoActual, mesActual, 0).getDate();
      hasta = `${añoActual}-${String(mesActual).padStart(2, "0")}-${ultimoDia}`;
    } else {
      desde = `${añoActual}-01-01`;
      hasta = `${añoActual}-12-31`;
    }

    const [resV, resL, resUrgentes] = await Promise.all([
      fetch(
        `${import.meta.env.VITE_API_URL}/resumen-maquina?tipo=vending&desde=${desde}&hasta=${hasta}`,
        {
          headers: { Authorization: "Bearer " + token },
        },
      ).then((r) => r.json()),
      fetch(
        `${import.meta.env.VITE_API_URL}/resumen-maquina?tipo=lavanderia&desde=${desde}&hasta=${hasta}`,
        {
          headers: { Authorization: "Bearer " + token },
        },
      ).then((r) => r.json()),
      fetch(
        `${import.meta.env.VITE_API_URL}/cambio-urgente?desde=${desde}&hasta=${hasta}`,
        {
          headers: { Authorization: "Bearer " + token },
        },
      ).then((r) => r.json()),
    ]);

    setCambio((resV.cambio || 0) + (resL.cambio || 0));
    setDiferencia((resV.diferencia || 0) + (resL.diferencia || 0));
    setUrgentes(Array.isArray(resUrgentes) ? resUrgentes : []);
    setCargando(false);
  }

  useEffect(() => {
    cargar(modo, dia, mes, año);
  }, [modo, dia, mes, año]);

  async function guardarUrgente(e) {
    e.preventDefault();
    if (!denominacion || !cantidad) return;
    setGuardando(true);

    await fetch(`${import.meta.env.VITE_API_URL}/cambio-urgente`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        fecha: fechaForm,
        denominacion: Number(denominacion),
        cantidad: Number(cantidad),
      }),
    });

    setDenominacion("");
    setCantidad("");
    setMostrarForm(false);
    setGuardando(false);
    cargar(modo, dia, mes, año);
  }

  async function eliminarUrgente(id) {
    if (!confirm("¿Eliminar este registro?")) return;
    await fetch(`${import.meta.env.VITE_API_URL}/cambio-urgente/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    cargar(modo, dia, mes, año);
  }

  const totalUrgente = urgentes.reduce((a, u) => a + u.total, 0);

  return (
    <div className="container py-4" style={{ maxWidth: 600 }}>
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate("/caja")}
      >
        ← Volver
      </button>
      <h2 className="mb-4">Cambio</h2>

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

            {(modo === "dia" || modo === "semana") && (
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  {modo === "semana" ? "Semana del" : "Fecha"}
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={dia}
                  onChange={(e) => setDia(e.target.value)}
                />
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
          </div>
        </div>
      </div>

      {/* Tabla resumen */}
      {cargando ? (
        <p className="text-muted">Cargando...</p>
      ) : (
        <>
          <div className="card mb-4">
            <div className="card-body p-0">
              <table className="table mb-0">
                <tbody>
                  <tr>
                    <td className="fw-semibold">🔄 Cambio devuelto</td>
                    <td className="text-end fs-5 fw-bold">
                      {cambio.toFixed(2)} €
                    </td>
                  </tr>
                  <tr
                    className={
                      diferencia === 0
                        ? "table-success"
                        : diferencia > 0
                          ? "table-warning"
                          : "table-danger"
                    }
                  >
                    <td className="fw-semibold">Diferencia</td>
                    <td className="text-end fs-5 fw-bold">
                      {diferencia > 0 ? "+" : ""}
                      {diferencia.toFixed(2)} €
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Cambio urgente */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">🚨 Cambio Urgente</h5>
            <button
              className="btn btn-sm btn-warning text-white"
              onClick={() => setMostrarForm(true)}
              disabled={mostrarForm}
            >
              + Agregar
            </button>
          </div>

          {mostrarForm && (
            <div className="card mb-3">
              <div className="card-body">
                <form onSubmit={guardarUrgente}>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">
                        Fecha
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={fechaForm}
                        onChange={(e) => setFechaForm(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">
                        Denominación
                      </label>
                      <select
                        className="form-select"
                        value={denominacion}
                        onChange={(e) => setDenominacion(e.target.value)}
                        required
                      >
                        <option value="">—</option>
                        {DENOMINACIONES.map((d) => (
                          <option key={d} value={d}>
                            {d < 1 ? `${(d * 100).toFixed(0)}c` : `${d}€`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small fw-semibold">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-success w-100"
                          disabled={guardando}
                        >
                          {guardando ? "..." : "✓"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary w-100"
                          onClick={() => {
                            setMostrarForm(false);
                            setDenominacion("");
                            setCantidad("");
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                  {denominacion && cantidad && (
                    <div className="mt-2 text-muted small">
                      Total:{" "}
                      <strong>
                        {(Number(denominacion) * Number(cantidad)).toFixed(2)} €
                      </strong>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {urgentes.length === 0 ? (
            <p className="text-muted">No hay cambio urgente en este período.</p>
          ) : (
            <div className="card">
              <div className="card-body p-0">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th className="text-end">Denominación</th>
                      <th className="text-end">Cantidad</th>
                      <th className="text-end">Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {urgentes.map((u) => (
                      <tr key={u.id}>
                        <td>{u.fecha.split("-").reverse().join("/")}</td>
                        <td className="text-end">
                          {u.denominacion < 1
                            ? `${(u.denominacion * 100).toFixed(0)}c`
                            : `${u.denominacion}€`}
                        </td>
                        <td className="text-end">{u.cantidad}</td>
                        <td className="text-end fw-semibold">
                          {u.total.toFixed(2)} €
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => eliminarUrgente(u.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th colSpan={3}>Total urgente</th>
                      <th className="text-end text-warning">
                        {totalUrgente.toFixed(2)} €
                      </th>
                      <th></th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
