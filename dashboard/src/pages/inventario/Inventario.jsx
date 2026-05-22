import { useNavigate } from "react-router-dom";

export default function Inventario() {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <h2 className="mb-4">Inventario</h2>

      <div className="d-flex gap-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/inventario/lavadoras")}
        >
          Lavadoras
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/inventario/vending")}
        >
          Vending
        </button>
      </div>
    </div>
  );
}
