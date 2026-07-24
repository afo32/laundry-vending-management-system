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

export default function GastosMensuales() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const hoy = new Date();

  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [año, setAño] = useState(hoy.getFullYear());
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [nuevaFila, setNuevaFila] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [editValores, setEditValores] = useState({});

  async function cargar() {
    setCargando(true);
    const desde = `${año}-${String(mes).padStart(2, "0")}-01`;
    const ultimoDia = new Date(año, mes, 0).getDate();
    const hasta = `${año}-${String(mes).padStart(2, "0")}-${ultimoDia}`;

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/gastos?desde=${desde}&hasta=${hasta}`,
      { headers: { Authorization: "Bearer " + token } },
    ).then((r) => r.json());

    setGastos(Array.isArray(res) ? res : []);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, [mes, año]);

  function agregarFila() {
    const fechaMes = `${año}-${String(mes).padStart(2, "0")}-01`;
    setNuevaFila({ descripcion: "", importe: "", fecha: fechaMes });
  }

  async function guardarNueva() {
    if (!nuevaFila.descripcion || !nuevaFila.importe) return;

    await fetch(`${import.meta.env.VITE_API_URL}/gastos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        descripcion: nuevaFila.descripcion,
        importe: Number(nuevaFila.importe),
        categoria: "mensual",
        fecha: nuevaFila.fecha,
      }),
    });

    setNuevaFila(null);
    cargar();
  }

  function empezarEdicion(g) {
    setEditandoId(g.id);
    setEditValores({ descripcion: g.descripcion, importe: g.importe });
  }

  async function guardarEdicion(id) {
    await fetch(`${import.meta.env.VITE_API_URL}/gastos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        descripcion: editValores.descripcion,
        importe: Number(editValores.importe),
        categoria: "mensual",
      }),
    });
    setEditandoId(null);
    cargar();
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este gasto?")) return;
    await fetch(`${import.meta.env.VITE_API_URL}/gastos/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    cargar();
  }

  const total = gastos.reduce((a, g) => a + g.importe, 0);

  return (
    <div className="container py-4">
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate("/reportes/gastos")}
      >
        ← Volver
      </button>
      <h2 className="mb-4">Gastos Mensuales</h2>

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
                + Nuevo gasto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="card border-0 bg-light mb-4">
        <div className="card-body">
          <div className="text-muted small">Total gastos del mes</div>
          <div className="fs-3 fw-bold text-danger">{total.toFixed(2)} €</div>
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
                  <th>Concepto</th>
                  <th className="text-end">Importe</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {/* Fila nueva */}
                {nuevaFila && (
                  <tr>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={nuevaFila.descripcion}
                        placeholder="Ej: Luz, Agua, Seguro..."
                        autoFocus
                        onChange={(e) =>
                          setNuevaFila({
                            ...nuevaFila,
                            descripcion: e.target.value,
                          })
                        }
                        onKeyDown={(e) => e.key === "Enter" && guardarNueva()}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control form-control-sm text-end"
                        value={nuevaFila.importe}
                        placeholder="0.00"
                        onChange={(e) =>
                          setNuevaFila({
                            ...nuevaFila,
                            importe: e.target.value,
                          })
                        }
                        onKeyDown={(e) => e.key === "Enter" && guardarNueva()}
                      />
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
                {gastos.map((g) => (
                  <tr key={g.id}>
                    {editandoId === g.id ? (
                      <>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editValores.descripcion}
                            autoFocus
                            onChange={(e) =>
                              setEditValores({
                                ...editValores,
                                descripcion: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control form-control-sm text-end"
                            value={editValores.importe}
                            onChange={(e) =>
                              setEditValores({
                                ...editValores,
                                importe: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="text-end">
                          <div className="d-flex gap-1 justify-content-end">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => guardarEdicion(g.id)}
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
                        <td>{g.descripcion}</td>
                        <td className="text-end fw-semibold">
                          {Number(g.importe).toFixed(2)} €
                        </td>
                        <td className="text-end">
                          <div className="d-flex gap-1 justify-content-end">
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => empezarEdicion(g)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => eliminar(g.id)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}

                {gastos.length === 0 && !nuevaFila && (
                  <tr>
                    <td colSpan={3} className="text-muted text-center py-3">
                      No hay gastos en este mes.
                    </td>
                  </tr>
                )}
              </tbody>
              {gastos.length > 0 && (
                <tfoot className="table-light">
                  <tr>
                    <th>Total</th>
                    <th className="text-end text-danger">
                      {total.toFixed(2)} €
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
