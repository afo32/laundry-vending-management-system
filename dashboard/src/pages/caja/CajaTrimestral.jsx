import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CajaTrimestral() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [año, setAño] = useState(new Date().getFullYear());
  const [trimestres, setTrimestres] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(null); // { mes, campo }
  const [valorEdit, setValorEdit] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/trimestral?año=${año}`, {
      headers: { Authorization: "Bearer " + token },
    }).then((r) => r.json());
    setTrimestres(res.trimestres || []);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, [año]);

  function empezarEdicion(mes, campo, valorActual) {
    setEditando({ mes, campo });
    setValorEdit(valorActual === 0 ? "" : valorActual);
  }

  async function guardarEdicion(mes, campo) {
    setGuardando(true);

    const body = { mes, año };
    if (campo === "tarjeta") body.monto = Number(valorEdit) || 0;
    if (campo === "efectivo_h") body.efectivo_h = Number(valorEdit) || 0;

    await fetch(`${import.meta.env.VITE_API_URL}/trimestral/tarjeta`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    });

    setEditando(null);
    setGuardando(false);
    cargar();
  }

  function renderCeldaEditable(mes, campo, valor) {
    const isEditing = editando?.mes === mes && editando?.campo === campo;

    if (isEditing) {
      return (
        <div className="d-flex gap-1 justify-content-end">
          <input
            type="number"
            step="0.01"
            className="form-control form-control-sm text-end"
            style={{ width: 100 }}
            value={valorEdit}
            autoFocus
            onChange={(e) => setValorEdit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && guardarEdicion(mes, campo)}
          />
          <button
            className="btn btn-sm btn-success"
            onClick={() => guardarEdicion(mes, campo)}
            disabled={guardando}
          >
            ✓
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setEditando(null)}
          >
            ✕
          </button>
        </div>
      );
    }

    return (
      <span
        style={{ cursor: "pointer" }}
        className="text-primary"
        onClick={() => empezarEdicion(mes, campo, valor)}
      >
        {valor.toFixed(2)} € ✏️
      </span>
    );
  }

  const totalEfectivoAño = trimestres.reduce((a, t) => a + t.total_efectivo, 0);
  const totalEfectivoHAño = trimestres.reduce(
    (a, t) => a + t.total_efectivo_h,
    0,
  );
  const totalTarjetaAño = trimestres.reduce((a, t) => a + t.total_tarjeta, 0);
  const totalAño = trimestres.reduce((a, t) => a + t.total, 0);

  return (
    <div className="container py-4">
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate("/caja")}
      >
        ← Volver
      </button>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Trimestral</h2>
        <input
          type="number"
          className="form-control"
          style={{ width: 140 }}
          value={año}
          onChange={(e) => setAño(Number(e.target.value))}
        />
      </div>

      {/* Resumen anual */}
      {!cargando && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <div className="text-muted small">Efectivo</div>
                <div className="fs-5 fw-bold">
                  {totalEfectivoAño.toFixed(2)} €
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <div className="text-muted small">Efectivo H</div>
                <div className="fs-5 fw-bold">
                  {totalEfectivoHAño.toFixed(2)} €
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <div className="text-muted small">Tarjeta</div>
                <div className="fs-5 fw-bold">
                  {totalTarjetaAño.toFixed(2)} €
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <div className="text-muted small">Total Año</div>
                <div className="fs-5 fw-bold text-success">
                  {totalAño.toFixed(2)} €
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {cargando ? (
        <p className="text-muted">Cargando...</p>
      ) : (
        trimestres.map((t) => (
          <div key={t.numero} className="card mb-4">
            <div className="card-header fw-semibold">
              Trimestre {t.numero} — {t.meses.map((m) => m.nombre).join(", ")}
            </div>
            <div className="card-body p-0">
              <table className="table mb-0">
                <thead className="table-light">
                  <tr>
                    <th></th>
                    <th className="text-end">Efectivo</th>
                    <th className="text-end">Efectivo H</th>
                    <th className="text-end">Tarjeta</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {t.meses.map((m) => (
                    <tr key={m.mes}>
                      <td className="fw-semibold">{m.nombre}</td>
                      <td className="text-end text-muted">
                        {m.efectivo.toFixed(2)} €
                      </td>
                      <td className="text-end">
                        {renderCeldaEditable(m.mes, "efectivo_h", m.efectivo_h)}
                      </td>
                      <td className="text-end">
                        {renderCeldaEditable(m.mes, "tarjeta", m.tarjeta)}
                      </td>
                      <td className="text-end fw-semibold">
                        {m.total.toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light">
                  <tr>
                    <th>Total trimestre</th>
                    <th className="text-end">
                      {t.total_efectivo.toFixed(2)} €
                    </th>
                    <th className="text-end">
                      {t.total_efectivo_h.toFixed(2)} €
                    </th>
                    <th className="text-end">{t.total_tarjeta.toFixed(2)} €</th>
                    <th className="text-end text-success">
                      {t.total.toFixed(2)} €
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
