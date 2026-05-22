import { useNavigate } from "react-router-dom";

export default function VentasPorMaquinaVending() {
  const navigate = useNavigate();

  const maquinas = ["Cafetera", "Comida"]; // Ajusta según tus máquinas reales

  return (
    <div className="container py-4">
      <h2 className="mb-4">Vending</h2>

      <div className="d-flex flex-wrap gap-3">
        {maquinas.map((m) => (
          <button
            key={m}
            className="btn btn-outline-secondary"
            onClick={() => navigate(`/reportes/ventas-maquina/vending/${m}`)}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
