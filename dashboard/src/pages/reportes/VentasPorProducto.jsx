import { useNavigate } from "react-router-dom";

export default function VentasPorProducto() {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <h2 className="mb-4">Ventas por Producto</h2>

      <div className="d-flex gap-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/reportes/ventas-producto/lavadoras")}
        >
          Lavadoras
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/reportes/ventas-producto/vending")}
        >
          Vending
        </button>
      </div>
    </div>
  );
}
