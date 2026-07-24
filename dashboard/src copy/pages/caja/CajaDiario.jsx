import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DENOMINACIONES = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50];

function filasIniciales() {
  return DENOMINACIONES.map((d) => ({
    denominacion: d,
    lavanderia: 0,
    vending: 0,
  }));
}

function filasDesdeDetalle(detalleLav, detalleVen) {
  return DENOMINACIONES.map((d) => {
    const lav = detalleLav?.find((x) => x.denominacion === d);
    const ven = detalleVen?.find((x) => x.denominacion === d);
    return {
      denominacion: d,
      lavanderia: lav ? lav.cantidad : 0,
      vending: ven ? ven.cantidad : 0,
    };
  });
}

export default function CajaDiario() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const hoy = new Date().toISOString().split("T")[0];

  const [fecha, setFecha] = useState(hoy);
  const [filas, setFilas] = useState(filasIniciales());
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarFecha() {
      setCargando(true);
      setGuardado(false);
      setError("");

      const [resLav, resVen] = await Promise.all([
        fetch(
          `http://127.0.0.1:5000/ganancia/buscar?fecha=${fecha}&tipo=lavanderia`,
          {
            headers: { Authorization: "Bearer " + token },
          },
        ).then((r) => r.json()),
        fetch(
          `http://127.0.0.1:5000/ganancia/buscar?fecha=${fecha}&tipo=vending`,
          {
            headers: { Authorization: "Bearer " + token },
          },
        ).then((r) => r.json()),
      ]);

      setFilas(filasDesdeDetalle(resLav?.detalle, resVen?.detalle));
      setCargando(false);
    }

    cargarFecha();
  }, [fecha]);

  function actualizar(index, tipo, valor) {
    const cantidad = Math.max(0, parseInt(valor) || 0);
    const nuevas = [...filas];
    nuevas[index] = { ...nuevas[index], [tipo]: cantidad };
    setFilas(nuevas);
  }

  const totalLav = filas.reduce(
    (acc, f) => acc + f.lavanderia * f.denominacion,
    0,
  );
  const totalVen = filas.reduce(
    (acc, f) => acc + f.vending * f.denominacion,
    0,
  );

  async function guardar() {
    setError("");
    setGuardado(false);
    setGuardando(true);

    try {
      await Promise.all([
        fetch("http://127.0.0.1:5000/ganancia", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            fecha,
            tipo: "lavanderia",
            detalle: filas.map((f) => ({
              denominacion: f.denominacion,
              cantidad: f.lavanderia,
            })),
          }),
        }),
        fetch("http://127.0.0.1:5000/ganancia", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            fecha,
            tipo: "vending",
            detalle: filas.map((f) => ({
              denominacion: f.denominacion,
              cantidad: f.vending,
            })),
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

  return (
    <div className="container py-4">
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate("/caja")}
      >
        ← Volver
      </button>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Diario</h2>
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
        <div className="alert alert-success">Guardado correctamente.</div>
      )}

      {/* Resumen */}
      {!cargando && (
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <div className="text-muted small">Lavandería</div>
                <div className="fs-4 fw-bold">{totalLav.toFixed(2)} €</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <div className="text-muted small">Vending</div>
                <div className="fs-4 fw-bold">{totalVen.toFixed(2)} €</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <div className="text-muted small">Total</div>
                <div className="fs-4 fw-bold text-success">
                  {(totalLav + totalVen).toFixed(2)} €
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      {cargando ? (
        <p className="text-muted">Cargando...</p>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Denominación</th>
                  <th className="text-end">Lavandería</th>
                  <th className="text-end">Subtotal</th>
                  <th className="text-end">Vending</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, i) => (
                  <tr key={fila.denominacion}>
                    <td className="text-muted fw-semibold">
                      {fila.denominacion < 1
                        ? `${(fila.denominacion * 100).toFixed(0)}c`
                        : `${fila.denominacion}€`}
                    </td>
                    <td className="text-end" style={{ width: 110 }}>
                      <input
                        type="number"
                        className="form-control form-control-sm text-end"
                        value={fila.lavanderia === 0 ? "" : fila.lavanderia}
                        min="0"
                        placeholder="0"
                        onChange={(e) =>
                          actualizar(i, "lavanderia", e.target.value)
                        }
                      />
                    </td>
                    <td className="text-end align-middle">
                      {(fila.lavanderia * fila.denominacion).toFixed(2)} €
                    </td>
                    <td className="text-end" style={{ width: 110 }}>
                      <input
                        type="number"
                        className="form-control form-control-sm text-end"
                        value={fila.vending === 0 ? "" : fila.vending}
                        min="0"
                        placeholder="0"
                        onChange={(e) =>
                          actualizar(i, "vending", e.target.value)
                        }
                      />
                    </td>
                    <td className="text-end align-middle">
                      {(fila.vending * fila.denominacion).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <th colSpan={2}>Total</th>
                  <th className="text-end text-success">
                    {totalLav.toFixed(2)} €
                  </th>
                  <th></th>
                  <th className="text-end text-success">
                    {totalVen.toFixed(2)} €
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
