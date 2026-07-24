import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DENOMINACIONES = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50];

function filaInicial() {
  return DENOMINACIONES.map((d) => ({ denominacion: d, cantidad: 0 }));
}

function filaDesdeDetalle(detalle) {
  return DENOMINACIONES.map((d) => {
    const encontrado = detalle.find((x) => x.denominacion === d);
    return { denominacion: d, cantidad: encontrado ? encontrado.cantidad : 0 };
  });
}

export default function CajaMaquinas() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const hoy = new Date().toISOString().split("T")[0];

  const [fecha, setFecha] = useState(hoy);
  const [expendedora, setExpendedora] = useState(filaInicial());
  const [lavanderia, setLavanderia] = useState(filaInicial());
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Cargar datos al cambiar fecha
  useEffect(() => {
    async function cargarFecha() {
      setCargando(true);
      setGuardado(false);
      setError("");

      const [resExp, resLav] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_API_URL}/caja/buscar?fecha=${fecha}&tipo=expendedora`,
          { headers: { Authorization: "Bearer " + token } },
        ).then((r) => r.json()),
        fetch(
          `${import.meta.env.VITE_API_URL}/caja/buscar?fecha=${fecha}&tipo=lavanderia`,
          { headers: { Authorization: "Bearer " + token } },
        ).then((r) => r.json()),
      ]);

      setExpendedora(resExp ? filaDesdeDetalle(resExp.detalle) : filaInicial());
      setLavanderia(resLav ? filaDesdeDetalle(resLav.detalle) : filaInicial());
      setCargando(false);
    }

    cargarFecha();
  }, [fecha]);

  function actualizarCantidad(tipo, index, valor) {
    const cantidad = Math.max(0, parseInt(valor) || 0);
    if (tipo === "expendedora") {
      const nuevas = [...expendedora];
      nuevas[index] = { ...nuevas[index], cantidad };
      setExpendedora(nuevas);
    } else {
      const nuevas = [...lavanderia];
      nuevas[index] = { ...nuevas[index], cantidad };
      setLavanderia(nuevas);
    }
  }

  const totalExpendedora = expendedora.reduce(
    (acc, f) => acc + f.cantidad * f.denominacion,
    0,
  );
  const totalLavanderia = lavanderia.reduce(
    (acc, f) => acc + f.cantidad * f.denominacion,
    0,
  );

  async function guardar() {
    setError("");
    setGuardado(false);
    setGuardando(true);

    try {
      await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/caja`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            fecha,
            tipo: "expendedora",
            detalle: expendedora,
          }),
        }),
        fetch(`${import.meta.env.VITE_API_URL}/caja`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            fecha,
            tipo: "lavanderia",
            detalle: lavanderia,
          }),
        }),
      ]);
      setGuardado(true);
    } catch (e) {
      setError("Error de conexión con el servidor");
    } finally {
      setGuardando(false);
    }
  }

  function renderTabla(tipo, filas) {
    const total = filas.reduce(
      (acc, f) => acc + f.cantidad * f.denominacion,
      0,
    );
    const titulo = tipo === "expendedora" ? "🏧 Expendedora" : "🧺 Lavandería";

    return (
      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-header fw-semibold">{titulo}</div>
          <div className="card-body p-0">
            <table className="table table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Denominación</th>
                  <th className="text-end">Cantidad</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, i) => (
                  <tr key={fila.denominacion}>
                    <td className="text-muted">
                      {fila.denominacion < 1
                        ? `${(fila.denominacion * 100).toFixed(0)}c`
                        : `${fila.denominacion}€`}
                    </td>
                    <td className="text-end" style={{ width: 100 }}>
                      <input
                        type="number"
                        className="form-control form-control-sm text-end"
                        value={fila.cantidad === 0 ? "" : fila.cantidad}
                        min="0"
                        placeholder="0"
                        onChange={(e) =>
                          actualizarCantidad(tipo, i, e.target.value)
                        }
                      />
                    </td>
                    <td className="text-end align-middle">
                      {(fila.cantidad * fila.denominacion).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <th colSpan={2}>Total</th>
                  <th className="text-end text-success">
                    {total.toFixed(2)} €
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate("/caja")}
      >
        ← Volver
      </button>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Cajas Máquinas</h2>
        <div className="d-flex align-items-center gap-3">
          <input
            type="date"
            className="form-control"
            style={{ width: 180 }}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <button
            className="btn btn-success"
            onClick={guardar}
            disabled={guardando || cargando}
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {guardado && (
        <div className="alert alert-success">
          Cajas guardadas correctamente.
        </div>
      )}
      {cargando && <p className="text-muted">Cargando datos...</p>}

      {/* Resumen */}
      {!cargando && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <div className="text-muted small">Expendedora</div>
                  <div className="fs-4 fw-bold">
                    {totalExpendedora.toFixed(2)} €
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <div className="text-muted small">Lavandería</div>
                  <div className="fs-4 fw-bold">
                    {totalLavanderia.toFixed(2)} €
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <div className="text-muted small">Total combinado</div>
                  <div className="fs-4 fw-bold text-success">
                    {(totalExpendedora + totalLavanderia).toFixed(2)} €
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {renderTabla("expendedora", expendedora)}
            {renderTabla("lavanderia", lavanderia)}
          </div>
        </>
      )}
    </div>
  );
}
