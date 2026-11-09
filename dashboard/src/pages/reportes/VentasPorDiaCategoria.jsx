import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const LABELS = {
  vending: { titulo: "Vending", emoji: "🥤" },
  lavanderia: { titulo: "Lavandería", emoji: "🧺" },
};

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

export default function VentasPorDiaCategoria() {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const label = LABELS[categoria] || { titulo: categoria, emoji: "📊" };

  const hoy = new Date();
  const [modo, setModo] = useState("mes");
  const [dia, setDia] = useState(hoy.toISOString().split("T")[0]);
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [año, setAño] = useState(hoy.getFullYear());

  const [ventas, setVentas] = useState([]); // lista plana de todas las ventas
  const [cargando, setCargando] = useState(false);

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

  async function cargar(modoActual, diaActual, mesActual, añoActual) {
    setCargando(true);

    let desde, hasta;
    if (modoActual === "dia") {
      desde = diaActual;
      hasta = diaActual;
    } else if (modoActual === "mes") {
      desde = `${añoActual}-${String(mesActual).padStart(2, "0")}-01`;
      const ultimoDia = new Date(añoActual, mesActual, 0).getDate();
      hasta = `${añoActual}-${String(mesActual).padStart(2, "0")}-${ultimoDia}`;
    } else {
      desde = `${añoActual}-01-01`;
      hasta = `${añoActual}-12-31`;
    }

    const diasRes = await fetch(
      `${import.meta.env.VITE_API_URL}/ventas/dia?categoria=${categoria}&desde=${desde}&hasta=${hasta}`,
      { headers: { Authorization: "Bearer " + token } },
    ).then((r) => r.json());

    if (!Array.isArray(diasRes) || diasRes.length === 0) {
      setVentas([]);
      setCargando(false);
      return;
    }

    const detalles = await Promise.all(
      diasRes.map((d) =>
        fetch(`${import.meta.env.VITE_API_URL}/ventas/dia/${d.id}`, {
          headers: { Authorization: "Bearer " + token },
        })
          .then((r) => r.json())
          .then((data) =>
            (data.ventas || []).map((v) => ({
              ...v,
              fecha: d.fecha,
              dia_id: d.id,
            })),
          ),
      ),
    );

    setVentas(detalles.flat());
    setCargando(false);
  }

  useEffect(() => {
    cargar(modo, dia, mes, año);
  }, [modo, dia, mes, año, categoria]);

  async function eliminarVenta(ventaId) {
    if (!confirm("¿Eliminar esta venta?")) return;
    await fetch(`${import.meta.env.VITE_API_URL}/ventas/${ventaId}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    cargar(modo, dia, mes, año);
  }

  const total = ventas.reduce((a, v) => a + v.cantidad * v.precio, 0);
  const unidades = ventas.reduce((a, v) => a + v.cantidad, 0);

  // Agrupar dia_ids únicos para poder eliminar por día
  const diasUnicos = [
    ...new Map(
      ventas.map((v) => [v.dia_id, { id: v.dia_id, fecha: v.fecha }]),
    ).values(),
  ];

  function renderTabla(filas) {
    const totalTabla = filas.reduce((a, v) => a + v.cantidad * v.precio, 0);
    return (
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th className="text-end">Cantidad</th>
            <th className="text-end">Precio</th>
            <th className="text-end">Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filas.map((v) => (
            <tr key={v.id}>
              <td className="text-muted">
                {v.fecha.split("-").reverse().join("/")}
              </td>
              <td>{v.producto_nombre || "—"}</td>
              <td className="text-end">{v.cantidad}</td>
              <td className="text-end">{Number(v.precio).toFixed(2)} €</td>
              <td className="text-end fw-semibold">
                {(v.cantidad * v.precio).toFixed(2)} €
              </td>
              <td className="text-end">
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => eliminarVenta(v.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="table-light">
          <tr>
            <th colSpan={4}>Total</th>
            <th className="text-end text-success">{totalTabla.toFixed(2)} €</th>
            <th></th>
          </tr>
        </tfoot>
      </table>
    );
  }

  return (
    <div className="container py-4">
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate("/reportes/ventas-dia")}
      >
        ← Volver
      </button>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          {label.emoji} Ventas — {label.titulo}
        </h2>
        <button
          className="btn btn-success"
          onClick={() => navigate("/ventas/nueva", { state: { categoria } })}
        >
          + Nueva Venta
        </button>
      </div>

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

      {/* Resumen */}
      {ventas.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <div className="text-muted small">Unidades</div>
                <div className="fs-3 fw-bold">{unidades}</div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <div className="text-muted small">Total</div>
                <div className="fs-3 fw-bold text-success">
                  {total.toFixed(2)} €
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      {cargando ? (
        <p className="text-muted">Cargando...</p>
      ) : ventas.length === 0 ? (
        <p className="text-muted">No hay ventas en ese período.</p>
      ) : (
        <>
          {/* Tabla Vending */}
          {ventas.filter((v) => v.producto_categoria === "vending").length >
            0 && (
            <div className="card mb-4">
              <div className="card-header fw-semibold">🥤 Vending</div>
              <div className="card-body p-0">
                {renderTabla(
                  ventas.filter((v) => v.producto_categoria === "vending"),
                )}
              </div>
            </div>
          )}

          {/* Tabla Café */}
          {ventas.filter((v) => v.producto_categoria === "cafe").length > 0 && (
            <div className="card mb-4">
              <div className="card-header fw-semibold">☕ Café</div>
              <div className="card-body p-0">
                {renderTabla(
                  ventas.filter((v) => v.producto_categoria === "cafe"),
                )}
              </div>
            </div>
          )}
          {/* Tabla Lavandería */}
          {ventas.filter((v) => v.producto_categoria === "lavanderia").length >
            0 && (
            <div className="card mb-4">
              <div className="card-header fw-semibold">🧺 Lavandería</div>
              <div className="card-body p-0">
                {renderTabla(
                  ventas.filter((v) => v.producto_categoria === "lavanderia"),
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
