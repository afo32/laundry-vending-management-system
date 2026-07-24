import { useNavigate } from "react-router-dom";

export default function ComprasPorMes() {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <h2 className="mb-4">Compras por Mes</h2>

      <div className="d-flex gap-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/reportes/compras-mes/lavadoras")}
        >
          Lavadoras
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/reportes/compras-mes/vending")}
        >
          Vending
        </button>
      </div>
    </div>
  );
}
