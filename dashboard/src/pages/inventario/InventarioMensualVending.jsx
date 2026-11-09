import { Fragment, useState, useEffect } from "react";
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

export default function InventarioMensualVending() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const hoy = new Date();
  const hoyStr = hoy.toISOString().split("T")[0];

  const [modo, setModo] = useState("mes");
  const [dia, setDia] = useState(hoyStr);
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [año, setAño] = useState(hoy.getFullYear());

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Formulario de merma
  const [mermaId, setMermaId] = useState(null);
  const [cantidadMerma, setCantidadMerma] = useState("");
  const [fechaMerma, setFechaMerma] = useState(hoyStr);
  const [guardando, setGuardando] = useState(false);

  function calcularRango(modoActual, diaActual, mesActual, añoActual) {
    if (modoActual === "dia") return { desde: diaActual, hasta: diaActual };
    if (modoActual === "mes") {
      const desde = `${añoActual}-${String(mesActual).padStart(2, "0")}-01`;
      const ultimoDia = new Date(añoActual, mesActual, 0).getDate();
      const hasta = `${añoActual}-${String(mesActual).padStart(2, "0")}-${ultimoDia}`;
      return { desde, hasta };
    }
    return { desde: `${añoActual}-01-01`, hasta: `${añoActual}-12-31` };
  }

  async function cargar(modoActual, diaActual, mesActual, añoActual) {
    setCargando(true);
    const { desde, hasta } = calcularRango(
      modoActual,
      diaActual,
      mesActual,
      añoActual,
    );

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/inventario/mensual?desde=${desde}&hasta=${hasta}`,
      { headers: { Authorization: "Bearer " + token } },
    ).then((r) => r.json());

    setProductos(Array.isArray(res) ? res : []);
    setCargando(false);
  }

  useEffect(() => {
    cargar(modo, dia, mes, año);
  }, [modo, dia, mes, año]);

  function abrirMerma(id) {
    setMermaId(id);
    setCantidadMerma("");
    setFechaMerma(hoyStr);
  }

  async function guardarMerma(p) {
    const cantidad = Number(cantidadMerma);
    if (!cantidad) return;
    setGuardando(true);

    await fetch(`${import.meta.env.VITE_API_URL}/merma`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        producto_id: p.id,
        cantidad,
        fecha: fechaMerma,
        origen: "inventario",
      }),
    });

    setMermaId(null);
    setCantidadMerma("");
    setGuardando(false);
    cargar(modo, dia, mes, año);
  }

  function renderFilas(lista, titulo, emoji) {
    if (lista.length === 0) return null;

    return (
      <>
        <tr className="table-secondary">
          <td colSpan={7} className="fw-semibold">
            {emoji} {titulo}
          </td>
        </tr>
        {lista.map((p) => (
          <Fragment key={p.id}>
            <tr>
              <td>{p.nombre}</td>
              <td className="text-muted">{p.codigo}</td>
              <td className="text-end">{p.stock}</td>
              <td className="text-end">{p.ventas}</td>
              <td className="text-end">
                {p.merma !== 0 ? (
                  p.merma
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td
                className={
                  "text-end fw-bold " + (p.total < 5 ? "text-danger" : "")
                }
              >
                {p.total}
              </td>
              <td className="text-end">
                <button
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => abrirMerma(p.id)}
                >
                  Merma
                </button>
              </td>
            </tr>

            {mermaId === p.id && (
              <tr className="table-light">
                <td colSpan={7}>
                  <div className="row g-2 align-items-end">
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">
                        Fecha
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={fechaMerma}
                        onChange={(e) => setFechaMerma(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">
                        Cantidad (positivo resta, negativo suma)
                      </label>
                      <input
                        type="number"
                        step="1"
                        className="form-control form-control-sm"
                        value={cantidadMerma}
                        autoFocus
                        placeholder="Ej: 2 o -3"
                        onChange={(e) => setCantidadMerma(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && guardarMerma(p)}
                      />
                    </div>
                    <div className="col-md-3">
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-success w-100"
                          onClick={() => guardarMerma(p)}
                          disabled={guardando}
                        >
                          {guardando ? "..." : "✓ Guardar"}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary w-100"
                          onClick={() => setMermaId(null)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </>
    );
  }

  const vending = productos.filter((p) => p.categoria === "vending");
  const cafe = productos.filter((p) => p.categoria === "cafe");

  return (
    <div className="container py-4">
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate("/inventario/mensual")}
      >
        ← Volver
      </button>
      <h2 className="mb-4">Inventario Mensual — Vending</h2>

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

      {/* Tabla */}
      <div className="card">
        <div className="card-body p-0">
          {cargando ? (
            <p className="text-muted p-3">Cargando...</p>
          ) : (
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Producto</th>
                  <th>Código</th>
                  <th className="text-end">Stock</th>
                  <th className="text-end">Ventas período</th>
                  <th className="text-end">Merma período</th>
                  <th className="text-end">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {renderFilas(vending, "Vending", "🥤")}
                {renderFilas(cafe, "Café", "☕")}
                {productos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-muted text-center py-3">
                      No hay productos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
