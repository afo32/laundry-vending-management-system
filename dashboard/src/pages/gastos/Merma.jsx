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

export default function Merma() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const hoy = new Date();

  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [año, setAño] = useState(hoy.getFullYear());
  const [mermas, setMermas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [fechaForm, setFechaForm] = useState(hoy.toISOString().split("T")[0]);
  const [guardando, setGuardando] = useState(false);

  // Cargar productos vending + cafe
  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/productos?categoria=vending`, {
        headers: { Authorization: "Bearer " + token },
      }).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/productos?categoria=cafe`, {
        headers: { Authorization: "Bearer " + token },
      }).then((r) => r.json()),
    ]).then(([vending, cafe]) => {
      const todos = [
        ...(Array.isArray(vending) ? vending : []),
        ...(Array.isArray(cafe) ? cafe : []),
      ];
      setProductos(todos);
    });
  }, []);

  async function cargar(mesActual, añoActual) {
    setCargando(true);
    const desde = `${añoActual}-${String(mesActual).padStart(2, "0")}-01`;
    const ultimoDia = new Date(añoActual, mesActual, 0).getDate();
    const hasta = `${añoActual}-${String(mesActual).padStart(2, "0")}-${ultimoDia}`;

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/merma?desde=${desde}&hasta=${hasta}`,
      { headers: { Authorization: "Bearer " + token } },
    ).then((r) => r.json());

    setMermas(Array.isArray(res) ? res : []);
    setCargando(false);
  }

  useEffect(() => {
    cargar(mes, año);
  }, [mes, año]);

  async function guardar(e) {
    e.preventDefault();
    if (!productoId || !cantidad) return;
    setGuardando(true);

    await fetch(`${import.meta.env.VITE_API_URL}/merma`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        producto_id: Number(productoId),
        cantidad: Number(cantidad),
        fecha: fechaForm,
      }),
    });

    setProductoId("");
    setCantidad("");
    setMostrarForm(false);
    setGuardando(false);
    cargar(mes, año);
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar esta merma? Se restaurará el stock.")) return;
    await fetch(`${import.meta.env.VITE_API_URL}/merma/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    cargar(mes, año);
  }

  const totalUnidades = mermas.reduce((a, m) => a + m.cantidad, 0);
  const vendingProductos = productos.filter((p) => p.categoria === "vending");
  const cafeProductos = productos.filter((p) => p.categoria === "cafe");

  return (
    <div className="container py-4">
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate("/reportes/gastos")}
      >
        ← Volver
      </button>
      <h2 className="mb-4">Merma</h2>

      {/* Filtro mes/año */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
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
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Año</label>
              <input
                type="number"
                className="form-control"
                value={año}
                onChange={(e) => setAño(Number(e.target.value))}
              />
            </div>
            <div className="col-md-3">
              <button
                className="btn btn-warning w-100 text-white"
                onClick={() => setMostrarForm(true)}
                disabled={mostrarForm}
              >
                + Agregar merma
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div className="card mb-4">
          <div className="card-header fw-semibold">Nueva merma</div>
          <div className="card-body">
            <form onSubmit={guardar}>
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fechaForm}
                    onChange={(e) => setFechaForm(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">
                    Producto
                  </label>
                  <select
                    className="form-select"
                    value={productoId}
                    onChange={(e) => setProductoId(e.target.value)}
                    required
                  >
                    <option value="">— Seleccioná —</option>
                    {vendingProductos.length > 0 && (
                      <optgroup label="🥤 Vending">
                        {vendingProductos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} (stock: {p.stock})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {cafeProductos.length > 0 && (
                      <optgroup label="☕ Café">
                        {cafeProductos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} (stock: {p.stock})
                          </option>
                        ))}
                      </optgroup>
                    )}
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
                <div className="col-md-2">
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
                        setProductoId("");
                        setCantidad("");
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resumen */}
      {mermas.length > 0 && (
        <div className="card border-0 bg-light mb-4">
          <div className="card-body">
            <div className="text-muted small">
              Total unidades de merma este mes
            </div>
            <div className="fs-3 fw-bold text-warning">{totalUnidades}</div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="card">
        <div className="card-body p-0">
          {cargando ? (
            <p className="text-muted p-3">Cargando...</p>
          ) : mermas.length === 0 ? (
            <p className="text-muted p-3">No hay mermas en este mes.</p>
          ) : (
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th className="text-end">Cantidad</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {mermas.map((m) => (
                  <tr key={m.id}>
                    <td className="text-muted">
                      {m.fecha.split("-").reverse().join("/")}
                    </td>
                    <td>{m.producto}</td>
                    <td className="text-end fw-semibold">{m.cantidad}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => eliminar(m.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <th colSpan={2}>Total unidades</th>
                  <th className="text-end text-warning">{totalUnidades}</th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
