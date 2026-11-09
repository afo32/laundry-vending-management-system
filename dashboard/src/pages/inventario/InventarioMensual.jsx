import { useNavigate } from "react-router-dom";

export default function InventarioMensual() {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate("/inventario")}
      >
        ← Volver
      </button>
      <h2 className="mb-4">Inventario Mensual</h2>

      <div className="d-flex gap-3">
        <button className="btn btn-primary">Lavandería</button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/inventario/mensual/vending")}
        >
          Vending
        </button>
      </div>
    </div>
  );
}
