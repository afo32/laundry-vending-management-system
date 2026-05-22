import { useNavigate } from "react-router-dom";

export default function VentasPorDia() {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <h2 className="mb-4">Ventas por Día</h2>

      <div className="d-flex gap-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/reportes/ventas-dia/lavadoras")}
        >
          Lavadoras
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/reportes/ventas-dia/vending")}
        >
          Vending
        </button>
      </div>
    </div>
  );
}
