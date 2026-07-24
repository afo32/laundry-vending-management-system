import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BotonNuevaVenta from "../../components/BotonNuevaVenta";

export default function VentasPorProductoLavadoras() {
  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/productos?categoria=lavadoras`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setProductos(data));
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Productos – Lavadoras</h2>
      <BotonNuevaVenta />

      <div className="list-group">
        {productos.map((p) => (
          <button
            key={p.id}
            className="list-group-item list-group-item-action"
            onClick={() =>
              navigate(`/reportes/ventas-producto/lavadoras/${p.id}`)
            }
          >
            {p.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
