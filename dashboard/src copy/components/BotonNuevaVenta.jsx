import { useNavigate } from "react-router-dom";

export default function BotonNuevaVenta() {
  const navigate = useNavigate();

  return (
    <button
      className="btn btn-success mb-3"
      onClick={() => navigate("/ventas/nueva")}
    >
      + Nueva Venta
    </button>
  );
}
