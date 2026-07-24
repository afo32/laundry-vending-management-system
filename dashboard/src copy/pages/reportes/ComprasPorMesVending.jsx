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

export default function ComprasPorMesVending() {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const hoy = new Date();
  const [modo, setModo] = useState("mes");
  const [dia, setDia] = useState(hoy.toISOString().split("T")[0]);
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [año, setAño] = useState(hoy.getFullYear());

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

  async function buscar() {
    setCargando(true);
    const { desde, hasta } = calcularRango();

    const [resVending, resCafe] = await Promise.all([
      fetch(
        `http://127.0.0.1:5000/compras?categoria=vending&desde=${desde}&hasta=${hasta}`,
        { headers: { Authorization: "Bearer " + token } },
      ).then((r) => r.json()),
      fetch(
        `http://127.0.0.1:5000/compras?categoria=cafe&desde=${desde}&hasta=${hasta}`,
        { headers: { Authorization: "Bearer " + token } },
      ).then((r) => r.json()),
    ]);

    const todas = [
      ...(Array.isArray(resVending) ? resVending : []),
      ...(Array.isArray(resCafe) ? resCafe : []),
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    setCompras(todas);
    setCargando(false);
  }

  useEffect(() => {
    buscar();
  }, []);

  const totalGeneral = compras.reduce((a, c) => a + c.total, 0);
  const unidadesTotal = compras.reduce((a, c) => a + c.cantidad, 0);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Compras — Vending</h2>

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
      {compras.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <div className="text-muted small">Unidades compradas</div>
                <div className="fs-3 fw-bold">{unidadesTotal}</div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <div className="text-muted small">Total invertido</div>
                <div className="fs-3 fw-bold text-danger">
                  {totalGeneral.toFixed(2)} €
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="card">
        <div className="card-body p-0">
          {cargando ? (
            <p className="text-muted p-3">Cargando...</p>
          ) : compras.length === 0 ? (
            <p className="text-muted p-3">No hay compras en ese período.</p>
          ) : (
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th className="text-end">Cantidad</th>
                  <th className="text-end">P. Compra</th>
                  <th className="text-end">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {compras.map((c) => (
                  <tr key={c.id}>
                    <td>{c.fecha.split("-").reverse().join("/")}</td>
                    <td>{c.producto}</td>
                    <td className="text-end">{c.cantidad}</td>
                    <td className="text-end">
                      {Number(c.precio).toFixed(2)} €
                    </td>
                    <td className="text-end fw-semibold">
                      {Number(c.total).toFixed(2)} €
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() =>
                          navigate(`/inventario/editar/${c.producto_id}`)
                        }
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <th colSpan={5}>Total</th>
                  <th className="text-end text-danger">
                    {totalGeneral.toFixed(2)} €
                  </th>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
