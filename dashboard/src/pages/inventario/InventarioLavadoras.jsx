import { useEffect, useState } from "react";
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

export default function InventarioLavadoras() {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Filtros
  const hoy = new Date();
  const [modo, setModo] = useState("mes"); // "dia", "mes", "año"
  const [dia, setDia] = useState(hoy.toISOString().split("T")[0]);
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [año, setAño] = useState(hoy.getFullYear());

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/productos?categoria=lavanderia`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []));
  }, []);

  function calcularRango() {
    if (modo === "dia") {
      return { desde: dia, hasta: dia };
    }
    if (modo === "mes") {
      const desde = `${año}-${String(mes).padStart(2, "0")}-01`;
      const ultimoDia = new Date(año, mes, 0).getDate();
      const hasta = `${año}-${String(mes).padStart(2, "0")}-${ultimoDia}`;
      return { desde, hasta };
    }
    if (modo === "año") {
      return { desde: `${año}-01-01`, hasta: `${año}-12-31` };
    }
  }

  async function buscarVentas() {
    setCargandoVentas(true);

    let desde, hasta;
    if (modo === "dia") {
      desde = dia;
      hasta = dia;
    } else if (modo === "mes") {
      desde = `${año}-${String(mes).padStart(2, "0")}-01`;
      const ultimoDia = new Date(año, mes, 0).getDate();
      hasta = `${año}-${String(mes).padStart(2, "0")}-${ultimoDia}`;
    } else {
      desde = `${año}-01-01`;
      hasta = `${año}-12-31`;
    }

    const params = new URLSearchParams({
      categoria: "lavanderia",
      desde,
      hasta,
    });
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/reportes/ventas-producto?${params}`,
      { headers: { Authorization: "Bearer " + token } },
    );
    const data = await res.json();
    setVentas(Array.isArray(data) ? data : []);
    setCargandoVentas(false);
  }

  // Cambiá el useEffect para que recargue cuando cambie el modo/fecha
  useEffect(() => {
    buscarVentas();
  }, [modo, dia, mes, año]);

  // Mapear ventas por producto_id para lookup rápido
  const ventasPorProducto = {};
  ventas.forEach((v) => {
    ventasPorProducto[v.producto_id] = v;
  });

  const totalUnidades = ventas.reduce((a, v) => a + v.cantidad, 0);
  const totalEuros = ventas.reduce((a, v) => a + v.total, 0);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Inventario — Lavandería</h2>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            {/* Modo */}
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

            {/* Día */}
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

            {/* Mes + Año */}
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

            {/* Solo Año */}
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
                <div className="text-muted small">Total usos</div>
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
                <th>Máquina</th>
                <th>Código</th>
                <th className="text-end">Usos</th>
                <th className="text-end">Total (€)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => {
                const v = ventasPorProducto[p.id];
                return (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td className="text-muted">{p.codigo}</td>
                    <td className="text-end">
                      {v ? v.cantidad : <span className="text-muted">—</span>}
                    </td>
                    <td className="text-end fw-semibold">
                      {v ? (
                        `${v.total.toFixed(2)} €`
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => navigate(`/inventario/editar/${p.id}`)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
