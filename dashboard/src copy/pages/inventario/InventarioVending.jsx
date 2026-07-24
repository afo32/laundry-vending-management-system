import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BotonNuevoProducto from "../../components/BotonNuevoProducto";

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

export default function InventarioVending() {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const hoy = new Date();
  const [modo, setModo] = useState("mes");
  const [dia, setDia] = useState(hoy.toISOString().split("T")[0]);
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [año, setAño] = useState(hoy.getFullYear());

  // Cargar productos vending + cafe
  useEffect(() => {
    Promise.all([
      fetch("http://127.0.0.1:5000/productos?categoria=vending", {
        headers: { Authorization: "Bearer " + token },
      }).then((r) => r.json()),
      fetch("http://127.0.0.1:5000/productos?categoria=cafe", {
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

  function calcularRango() {
    if (modo === "dia") return { desde: dia, hasta: dia };
    if (modo === "mes") {
      const desde = `${año}-${String(mes).padStart(2, "0")}-01`;
      const ultimoDia = new Date(año, mes, 0).getDate();
      const hasta = `${año}-${String(mes).padStart(2, "0")}-${ultimoDia}`;
      return { desde, hasta };
    }
    return { desde: `${año}-01-01`, hasta: `${año}-12-31` };
  }

  async function buscarVentas() {
    setCargandoVentas(true);
    const { desde, hasta } = calcularRango();

    // Buscar ventas de vending y cafe juntas
    const [resVending, resCafe] = await Promise.all([
      fetch(
        `http://127.0.0.1:5000/reportes/ventas-producto?categoria=vending&desde=${desde}&hasta=${hasta}`,
        { headers: { Authorization: "Bearer " + token } },
      ).then((r) => r.json()),
      fetch(
        `http://127.0.0.1:5000/reportes/ventas-producto?categoria=cafe&desde=${desde}&hasta=${hasta}`,
        { headers: { Authorization: "Bearer " + token } },
      ).then((r) => r.json()),
    ]);

    const todas = [
      ...(Array.isArray(resVending) ? resVending : []),
      ...(Array.isArray(resCafe) ? resCafe : []),
    ];
    setVentas(todas);
    setCargandoVentas(false);
  }

  useEffect(() => {
    buscarVentas();
  }, []);

  const ventasPorProducto = {};
  ventas.forEach((v) => {
    ventasPorProducto[v.producto_id] = v;
  });

  const totalUnidades = ventas.reduce((a, v) => a + v.cantidad, 0);
  const totalEuros = ventas.reduce((a, v) => a + v.total, 0);

  function eliminarProducto(id) {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
    fetch(`http://127.0.0.1:5000/productos/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    })
      .then((r) => r.json())
      .then(() => setProductos((prev) => prev.filter((p) => p.id !== id)));
  }

  const vendingProductos = productos.filter((p) => p.categoria === "vending");
  const cafeProductos = productos.filter((p) => p.categoria === "cafe");

  function renderTabla(lista, titulo, emoji) {
    return (
      <>
        <tr className="table-secondary">
          <td colSpan={7} className="fw-semibold">
            {emoji} {titulo}
          </td>
        </tr>
        {lista.map((p) => {
          const v = ventasPorProducto[p.id];
          const margen =
            p.precio > 0 && p.precio_compra > 0
              ? (((p.precio - p.precio_compra) / p.precio) * 100).toFixed(1)
              : null;

          return (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td className="text-muted">{p.codigo}</td>
              <td
                className={
                  "text-end " + (p.stock < 5 ? "text-danger fw-bold" : "")
                }
              >
                {p.stock}
              </td>
              <td className="text-end">
                {p.precio_compra > 0 ? (
                  `${Number(p.precio_compra).toFixed(2)} €`
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="text-end">{Number(p.precio).toFixed(2)} €</td>
              <td className="text-end">
                {margen ? (
                  <span className="badge bg-success">{margen}%</span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="text-end">
                {v ? (
                  <span className="fw-semibold">
                    {v.cantidad}{" "}
                    <span className="text-muted small">
                      ({v.total.toFixed(2)} €)
                    </span>
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="text-end">
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => navigate(`/inventario/editar/${p.id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => eliminarProducto(p.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">Inventario — Vending</h2>
      <BotonNuevoProducto />

      {/* Filtros */}
      <div className="card my-4">
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

            <div className="col-md-2">
              <button
                className="btn btn-primary w-100"
                onClick={buscarVentas}
                disabled={cargandoVentas}
              >
                {cargandoVentas ? "..." : "Buscar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen */}
      {ventas.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <div className="text-muted small">Total unidades vendidas</div>
                <div className="fs-3 fw-bold">{totalUnidades}</div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <div className="text-muted small">Total recaudado</div>
                <div className="fs-3 fw-bold text-success">
                  {totalEuros.toFixed(2)} €
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="card">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th className="text-end">Stock</th>
                <th className="text-end">P. Compra</th>
                <th className="text-end">P. Venta</th>
                <th className="text-end">Margen</th>
                <th className="text-end">Ventas período</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {renderTabla(vendingProductos, "Vending", "🥤")}
              {renderTabla(cafeProductos, "Café", "☕")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
