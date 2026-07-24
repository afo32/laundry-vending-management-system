import { useNavigate } from "react-router-dom";

export default function VentasPorMaquina() {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <h2 className="mb-4">Ventas por Máquina</h2>

      <div className="d-flex gap-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/reportes/ventas-maquina/lavadoras")}
        >
          Lavadoras
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/reportes/ventas-maquina/vending")}
        >
          Vending
        </button>
      </div>
    </div>
  );
}
