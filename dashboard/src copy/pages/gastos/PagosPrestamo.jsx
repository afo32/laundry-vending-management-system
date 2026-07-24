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

export default function PagosPrestamo() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const hoy = new Date();

  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [año, setAño] = useState(hoy.getFullYear());
  const [pagos, setPagos] = useState([]);
  const [totalAcumulado, setTotalAcumulado] = useState({
    tarjeta: 0,
    efectivo: 0,
    total: 0,
  });
  const [cargando, setCargando] = useState(false);

  // Fila nueva en edición inline
  const [nuevaFila, setNuevaFila] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [editValores, setEditValores] = useState({});

  async function cargar() {
    setCargando(true);
    const desde = `${año}-${String(mes).padStart(2, "0")}-01`;
    const ultimoDia = new Date(año, mes, 0).getDate();
    const hasta = `${año}-${String(mes).padStart(2, "0")}-${ultimoDia}`;

    const res = await fetch(
      `http://127.0.0.1:5000/pagos-prestamo?desde=${desde}&hasta=${hasta}`,
      { headers: { Authorization: "Bearer " + token } },
    ).then((r) => r.json());

    setPagos(res.pagos || []);
    setTotalAcumulado(
      res.total_acumulado || { tarjeta: 0, efectivo: 0, total: 0 },
    );
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, [mes, año]);

  function agregarFila() {
    setNuevaFila({
      fecha: hoy.toISOString().split("T")[0],
      tarjeta: "",
      efectivo: "",
    });
  }

  async function guardarNueva() {
    if (!nuevaFila.fecha) return;

    await fetch("http://127.0.0.1:5000/pagos-prestamo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        fecha: nuevaFila.fecha,
        tarjeta: Number(nuevaFila.tarjeta) || 0,
        efectivo: Number(nuevaFila.efectivo) || 0,
      }),
    });

    setNuevaFila(null);
    cargar();
  }

  function empezarEdicion(p) {
    setEditandoId(p.id);
    setEditValores({
      fecha: p.fecha,
      tarjeta: p.tarjeta,
      efectivo: p.efectivo,
    });
  }

  async function guardarEdicion(id) {
    await fetch(`http://127.0.0.1:5000/pagos-prestamo/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        fecha: editValores.fecha,
        tarjeta: Number(editValores.tarjeta) || 0,
        efectivo: Number(editValores.efectivo) || 0,
      }),
    });
    setEditandoId(null);
    cargar();
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este pago?")) return;
    await fetch(`http://127.0.0.1:5000/pagos-prestamo/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    cargar();
  }

  const totalMes = pagos.reduce((a, p) => a + p.total, 0);
  const totalMesTarjeta = pagos.reduce((a, p) => a + p.tarjeta, 0);
  const totalMesEfectivo = pagos.reduce((a, p) => a + p.efectivo, 0);

  return (
    <div className="container py-4">
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate("/reportes/gastos")}
      >
        ← Volver
      </button>
      <h2 className="mb-4">Pagos Préstamo</h2>

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
                className="btn btn-success w-100"
                onClick={agregarFila}
                disabled={!!nuevaFila}
              >
                + Nuevo pago
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Total acumulado */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <div className="text-muted small">Total acumulado tarjeta</div>
              <div className="fs-5 fw-bold">
                {totalAcumulado.tarjeta.toFixed(2)} €
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <div className="text-muted small">Total acumulado efectivo</div>
              <div className="fs-5 fw-bold">
                {totalAcumulado.efectivo.toFixed(2)} €
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <div className="text-muted small">Total acumulado préstamo</div>
              <div className="fs-5 fw-bold text-danger">
                {totalAcumulado.total.toFixed(2)} €
              </div>
            </div>
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
                  <th>Fecha</th>
                  <th className="text-end">Tarjeta</th>
                  <th className="text-end">Efectivo</th>
                  <th className="text-end">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {/* Fila nueva */}
                {nuevaFila && (
                  <tr>
                    <td>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={nuevaFila.fecha}
                        onChange={(e) =>
                          setNuevaFila({ ...nuevaFila, fecha: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control form-control-sm text-end"
                        value={nuevaFila.tarjeta}
                        placeholder="0.00"
                        onChange={(e) =>
                          setNuevaFila({
                            ...nuevaFila,
                            tarjeta: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control form-control-sm text-end"
                        value={nuevaFila.efectivo}
                        placeholder="0.00"
                        onChange={(e) =>
                          setNuevaFila({
                            ...nuevaFila,
                            efectivo: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="text-end align-middle fw-semibold">
                      {(
                        (Number(nuevaFila.tarjeta) || 0) +
                        (Number(nuevaFila.efectivo) || 0)
                      ).toFixed(2)}{" "}
                      €
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={guardarNueva}
                        >
                          ✓
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setNuevaFila(null)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Filas existentes */}
                {pagos.map((p) => (
                  <tr key={p.id}>
                    {editandoId === p.id ? (
                      <>
                        <td>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={editValores.fecha}
                            onChange={(e) =>
                              setEditValores({
                                ...editValores,
                                fecha: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control form-control-sm text-end"
                            value={editValores.tarjeta}
                            onChange={(e) =>
                              setEditValores({
                                ...editValores,
                                tarjeta: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control form-control-sm text-end"
                            value={editValores.efectivo}
                            onChange={(e) =>
                              setEditValores({
                                ...editValores,
                                efectivo: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="text-end align-middle fw-semibold">
                          {(
                            (Number(editValores.tarjeta) || 0) +
                            (Number(editValores.efectivo) || 0)
                          ).toFixed(2)}{" "}
                          €
                        </td>
                        <td className="text-end">
                          <div className="d-flex gap-1 justify-content-end">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => guardarEdicion(p.id)}
                            >
                              ✓
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setEditandoId(null)}
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{p.fecha.split("-").reverse().join("/")}</td>
                        <td className="text-end">{p.tarjeta.toFixed(2)} €</td>
                        <td className="text-end">{p.efectivo.toFixed(2)} €</td>
                        <td className="text-end fw-semibold">
                          {p.total.toFixed(2)} €
                        </td>
                        <td className="text-end">
                          <div className="d-flex gap-1 justify-content-end">
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => empezarEdicion(p)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => eliminar(p.id)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}

                {pagos.length === 0 && !nuevaFila && (
                  <tr>
                    <td colSpan={5} className="text-muted text-center py-3">
                      No hay pagos en este mes.
                    </td>
                  </tr>
                )}
              </tbody>
              {pagos.length > 0 && (
                <tfoot className="table-light">
                  <tr>
                    <th>Total mes</th>
                    <th className="text-end">{totalMesTarjeta.toFixed(2)} €</th>
                    <th className="text-end">
                      {totalMesEfectivo.toFixed(2)} €
                    </th>
                    <th className="text-end text-danger">
                      {totalMes.toFixed(2)} €
                    </th>
                    <th></th>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
