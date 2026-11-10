import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const POR_DEFECTO = [
  { concepto: "IRPF", porcentaje: 10 },
  { concepto: "Seguro", porcentaje: 1 },
  { concepto: "Mi sueldo", porcentaje: 30 },
  { concepto: "Préstamo", porcentaje: 15 },
  { concepto: "Ahorros", porcentaje: 5 },
];

const CLAVE = "rutina_semanal_porcentajes";

function cargarGuardado() {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // sin almacenamiento: usamos los valores por defecto
  }
  return POR_DEFECTO;
}

export default function RutinaSemanal() {
  const navigate = useNavigate();
  const [total, setTotal] = useState("");
  const [filas, setFilas] = useState(cargarGuardado);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(filas));
    } catch (e) {
      // ignorar
    }
  }, [filas]);

  function cambiarPorcentaje(index, valor) {
    const nuevas = [...filas];
    nuevas[index] = { ...nuevas[index], porcentaje: valor };
    setFilas(nuevas);
  }

  function restaurar() {
    setFilas(POR_DEFECTO);
  }

  const monto = Number(total) || 0;
  const sumaPorcentajes = filas.reduce(
    (a, f) => a + (Number(f.porcentaje) || 0),
    0,
  );
  const resto = 100 - sumaPorcentajes;
  const importe = (p) => (monto * (Number(p) || 0)) / 100;
  const totalAsignado = filas.reduce((a, f) => a + importe(f.porcentaje), 0);

  return (
    <div className="container py-4" style={{ maxWidth: 600 }}>
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate("/reportes/gastos")}
      >
        ← Volver
      </button>
      <h2 className="mb-4">Rutina Semanal</h2>

      <div className="card mb-4">
        <div className="card-body">
          <label className="form-label fw-semibold">Total a repartir (€)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="form-control form-control-lg"
            value={total}
            placeholder="Ej: 500"
            autoFocus
            onChange={(e) => setTotal(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <table className="table mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Concepto</th>
                <th className="text-end" style={{ width: 110 }}>
                  %
                </th>
                <th className="text-end">Importe</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={f.concepto}>
                  <td className="fw-semibold">{f.concepto}</td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="form-control form-control-sm text-end"
                      value={f.porcentaje}
                      onChange={(e) => cambiarPorcentaje(i, e.target.value)}
                    />
                  </td>
                  <td className="text-end fw-semibold">
                    {importe(f.porcentaje).toFixed(2)} €
                  </td>
                </tr>
              ))}
              <tr className={resto < 0 ? "table-danger" : "table-light"}>
                <td className="text-muted">Resto</td>
                <td className="text-end text-muted">{resto.toFixed(1)} %</td>
                <td className="text-end">{importe(resto).toFixed(2)} €</td>
              </tr>
            </tbody>
            <tfoot className="table-light">
              <tr>
                <th>Total asignado</th>
                <th className="text-end">{sumaPorcentajes.toFixed(1)} %</th>
                <th className="text-end text-success">
                  {totalAsignado.toFixed(2)} €
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {resto < 0 && (
        <div className="alert alert-danger mt-3">
          Los porcentajes suman más del 100 %.
        </div>
      )}

      <button
        className="btn btn-outline-secondary btn-sm mt-3"
        onClick={restaurar}
      >
        Restaurar porcentajes
      </button>
    </div>
  );
}
