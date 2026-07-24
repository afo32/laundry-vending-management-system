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

export default function CajaMaquinasResumen() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const hoy = new Date();
  const hoyStr = hoy.toISOString().split("T")[0];

  const [modo, setModo] = useState("mes");
  const [dia, setDia] = useState(hoyStr);
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [año, setAño] = useState(hoy.getFullYear());

  const [resumenVending, setResumenVending] = useState(null);
  const [resumenLav, setResumenLav] = useState(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);

  const [tipoForm, setTipoForm] = useState("vending");
  const [fechaForm, setFechaForm] = useState(hoyStr);
  const [hucha, setHucha] = useState("");
  const [monedas, setMonedas] = useState("");
  const [billetes, setBilletes] = useState("");
  const [cambioForm, setCambioForm] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [historialVending, setHistorialVending] = useState([]);
  const [historialLav, setHistorialLav] = useState([]);

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

  async function cargarResumen() {
    setCargandoResumen(true);
    const { desde, hasta } = calcularRango();

    const [resV, resL] = await Promise.all([
      fetch(
        `http://127.0.0.1:5000/resumen-maquina?tipo=vending&desde=${desde}&hasta=${hasta}`,
        {
          headers: { Authorization: "Bearer " + token },
        },
      ).then((r) => r.json()),
      fetch(
        `http://127.0.0.1:5000/resumen-maquina?tipo=lavanderia&desde=${desde}&hasta=${hasta}`,
        {
          headers: { Authorization: "Bearer " + token },
        },
      ).then((r) => r.json()),
    ]);

    setResumenVending(resV);
    setResumenLav(resL);
    setCargandoResumen(false);
  }

  async function cargarHistorial() {
    const [hV, hL] = await Promise.all([
      fetch(`http://127.0.0.1:5000/resumen-maquina/entradas?tipo=vending`, {
        headers: { Authorization: "Bearer " + token },
      }).then((r) => r.json()),
      fetch(`http://127.0.0.1:5000/resumen-maquina/entradas?tipo=lavanderia`, {
        headers: { Authorization: "Bearer " + token },
      }).then((r) => r.json()),
    ]);
    setHistorialVending(Array.isArray(hV) ? hV : []);
    setHistorialLav(Array.isArray(hL) ? hL : []);
  }

  useEffect(() => {
    cargarResumen();
  }, [modo, dia, mes, año]);
  useEffect(() => {
    cargarHistorial();
  }, []);

  async function guardarEntrada(e) {
    e.preventDefault();
    setGuardando(true);

    await fetch("http://127.0.0.1:5000/resumen-maquina/entradas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        fecha: fechaForm,
        tipo: tipoForm,
        hucha: Number(hucha) || 0,
        monedas: Number(monedas) || 0,
        billetes: Number(billetes) || 0,
        cambio: Number(cambioForm) || 0,
        tarjeta: tipoForm === "lavanderia" ? Number(tarjeta) || 0 : 0,
      }),
    });

    setHucha("");
    setMonedas("");
    setBilletes("");
    setCambioForm("");
    setTarjeta("");
    setGuardando(false);
    cargarResumen();
    cargarHistorial();
  }

  async function eliminarEntrada(id) {
    if (!confirm("¿Eliminar este registro?")) return;
    await fetch(`http://127.0.0.1:5000/resumen-maquina/entradas/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    cargarResumen();
    cargarHistorial();
  }

  function renderResumen(titulo, emoji, r, esLavanderia = false) {
    if (!r) return null;
    const diferencia = r.diferencia;

    return (
      <div className="card mb-4">
        <div className="card-header fw-semibold fs-5">
          {emoji} {titulo}
        </div>
        <div className="card-body p-0">
          <table className="table table-sm mb-0">
            <tbody>
              <tr>
                <td className="text-muted">Total en máquina (ventas)</td>
                <td className="text-end fw-semibold">
                  {r.total_ventas.toFixed(2)} €
                </td>
              </tr>
              <tr>
                <td className="text-muted">Entrada — 🏦 Hucha</td>
                <td className="text-end">{r.entrada_hucha.toFixed(2)} €</td>
              </tr>
              <tr>
                <td className="text-muted">Entrada — 🪙 Monedas</td>
                <td className="text-end">{r.entrada_monedas.toFixed(2)} €</td>
              </tr>
              <tr>
                <td className="text-muted">Entrada — 💵 Billetes</td>
                <td className="text-end">{r.entrada_billetes.toFixed(2)} €</td>
              </tr>
              {esLavanderia && (
                <tr>
                  <td className="text-muted">Entrada — 💳 Tarjeta</td>
                  <td className="text-end">{(r.tarjeta || 0).toFixed(2)} €</td>
                </tr>
              )}
              <tr className="table-light">
                <td className="fw-semibold">Total entrada</td>
                <td className="text-end fw-semibold">
                  {r.entrada_total.toFixed(2)} €
                </td>
              </tr>
              <tr>
                <td className="text-muted">🔄 Cambio devuelto</td>
                <td className="text-end">{r.cambio.toFixed(2)} €</td>
              </tr>
              <tr className="table-light">
                <td className="fw-semibold">Total (entrada - cambio)</td>
                <td className="text-end fw-semibold">
                  {r.total_entrada_cambio.toFixed(2)} €
                </td>
              </tr>
              <tr>
                <td className="text-muted">Salida de máquina (diario)</td>
                <td className="text-end fw-semibold">
                  {r.total_salida.toFixed(2)} €
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr
                className={
                  diferencia === 0
                    ? "table-success"
                    : diferencia > 0
                      ? "table-warning"
                      : "table-danger"
                }
              >
                <th>Diferencia</th>
                <th className="text-end">
                  {diferencia > 0 ? "+" : ""}
                  {diferencia.toFixed(2)} €{diferencia === 0 && " ✓"}
                  {diferencia > 0 && " ⚠️"}
                  {diferencia < 0 && " ❌"}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  function renderHistorial(titulo, historial, esLavanderia = false) {
    return (
      <div className="card mb-4">
        <div className="card-header fw-semibold">{titulo} — Historial</div>
        <div className="card-body p-0">
          {historial.length === 0 ? (
            <p className="text-muted p-3 mb-0">Sin registros.</p>
          ) : (
            <table className="table table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Fecha</th>
                  <th className="text-end">Hucha</th>
                  <th className="text-end">Monedas</th>
                  <th className="text-end">Billetes</th>
                  {esLavanderia && <th className="text-end">Tarjeta</th>}
                  <th className="text-end">Cambio</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {historial.map((e) => (
                  <tr key={e.id}>
                    <td>{e.fecha.split("-").reverse().join("/")}</td>
                    <td className="text-end">{e.hucha.toFixed(2)} €</td>
                    <td className="text-end">{e.monedas.toFixed(2)} €</td>
                    <td className="text-end">{e.billetes.toFixed(2)} €</td>
                    {esLavanderia && (
                      <td className="text-end">
                        {(e.tarjeta || 0).toFixed(2)} €
                      </td>
                    )}
                    <td className="text-end">{e.cambio.toFixed(2)} €</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => eliminarEntrada(e.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 700 }}>
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate("/caja")}
      >
        ← Volver
      </button>
      <h2 className="mb-4">Resumen Máquinas</h2>

      {/* Formulario nueva entrada */}
      <div className="card mb-4">
        <div className="card-header fw-semibold">Registrar entrada</div>
        <div className="card-body">
          <form onSubmit={guardarEntrada}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Máquina</label>
                <select
                  className="form-select"
                  value={tipoForm}
                  onChange={(e) => {
                    setTipoForm(e.target.value);
                    setTarjeta("");
                  }}
                >
                  <option value="vending">🥤 Vending</option>
                  <option value="lavanderia">🧺 Lavandería</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaForm}
                  onChange={(e) => setFechaForm(e.target.value)}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label small fw-semibold">
                  🏦 Hucha (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={hucha}
                  placeholder="0.00"
                  onChange={(e) => setHucha(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">
                  🪙 Monedas (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={monedas}
                  placeholder="0.00"
                  onChange={(e) => setMonedas(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">
                  💵 Billetes (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={billetes}
                  placeholder="0.00"
                  onChange={(e) => setBilletes(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">
                  🔄 Cambio (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={cambioForm}
                  placeholder="0.00"
                  onChange={(e) => setCambioForm(e.target.value)}
                />
              </div>
              {tipoForm === "lavanderia" && (
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">
                    💳 Tarjeta (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={tarjeta}
                    placeholder="0.00"
                    onChange={(e) => setTarjeta(e.target.value)}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar entrada"}
            </button>
          </form>
        </div>
      </div>

      {/* Filtro período */}
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

      {cargandoResumen ? (
        <p className="text-muted">Cargando...</p>
      ) : (
        <>
          {renderResumen("Vending", "🥤", resumenVending, false)}
          {renderResumen("Lavandería", "🧺", resumenLav, true)}
        </>
      )}

      {renderHistorial("🥤 Vending", historialVending, false)}
      {renderHistorial("🧺 Lavandería", historialLav, true)}
    </div>
  );
}
