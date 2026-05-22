import { useNavigate } from "react-router-dom";

export default function VentasPorMaquinaLavadoras() {
  const navigate = useNavigate();

  const maquinas = ["L1", "L2", "L3", "S1", "S2", "IS1", "IS2"];

  return (
    <div className="container py-4">
      <h2 className="mb-4">Lavadoras</h2>

      <div className="d-flex flex-wrap gap-3">
        {maquinas.map((m) => (
          <button
            key={m}
            className="btn btn-outline-primary"
            onClick={() => navigate(`/reportes/ventas-maquina/lavadoras/${m}`)}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
