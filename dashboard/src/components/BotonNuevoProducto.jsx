import { useNavigate } from "react-router-dom";

export default function BotonNuevoProducto() {
  const navigate = useNavigate();

  return (
    <button
      className="btn btn-success mb-3"
      onClick={() => navigate("/inventario/nuevo")}
    >
      + Agregar Producto
    </button>
  );
}
