import { useNavigate } from "react-router-dom";

export default function BotonNuevaCompra() {
  const navigate = useNavigate();

  return (
    <button
      className="btn btn-warning mb-3"
      onClick={() => navigate("/compras/nueva")}
    >
      + Nueva Compra
    </button>
  );
}
