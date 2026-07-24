// dashboard/src/pages/reportes/VentasPorDia.jsx
import { useNavigate } from "react-router-dom";

export default function VentasPorDia() {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <h2 className="mb-1">Ventas por Día</h2>
      <p className="text-muted mb-4">
        Seleccioná una categoría para ver el detalle
      </p>

      <div className="row g-3">
        <div className="col-md-6">
          <div
            className="card h-100 border-primary"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/reportes/ventas-dia/lavanderia")}
          >
            <div className="card-body text-center py-4">
              <div style={{ fontSize: "2.5rem" }}>🧺</div>
              <h4 className="mt-2">Lavandería</h4>
              <p className="text-muted small">Lavadoras y secadoras</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div
            className="card h-100 border-secondary"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/reportes/ventas-dia/vending")}
          >
            <div className="card-body text-center py-4">
              <div style={{ fontSize: "2.5rem" }}>🥤</div>
              <h4 className="mt-2">Vending</h4>
              <p className="text-muted small">Máquina vending y cafés</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
