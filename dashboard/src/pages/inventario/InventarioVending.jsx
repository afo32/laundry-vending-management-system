import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BotonNuevoProducto from "../../components/BotonNuevoProducto";

export default function InventarioVending() {
  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:5000/productos?categoria=vending", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("RESPUESTA PRODUCTOS:", data);

        if (Array.isArray(data)) {
          setProductos(data);
        } else if (Array.isArray(data.productos)) {
          setProductos(data.productos);
        } else {
          setProductos([]);
        }
      });
  }, []);

  function eliminarProducto(id) {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) {
      return;
    }

    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:5000/productos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then(() => {
        // Actualizar lista sin recargar
        setProductos((prev) => prev.filter((p) => p.id !== id));
      });
  }

  return (
    <div className="container py-4">
      <h2>Inventario – Vending</h2>
      <BotonNuevoProducto />
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Código</th>

            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.codigo}</td>

              <td className={p.stock < 5 ? "text-danger fw-bold" : ""}>
                {p.stock}
              </td>
              <td className="text-end d-flex gap-2 justify-content-end">
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => navigate(`/inventario/editar/${p.id}`)}
                >
                  Editar
                </button>

                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => eliminarProducto(p.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
