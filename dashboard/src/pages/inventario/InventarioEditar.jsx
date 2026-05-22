import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function InventarioEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [stock, setStock] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:5000/productos/${id}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        setProducto(data);
        setStock(data.stock);
      });
  }, [id]);

  function guardar(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:5000/productos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ stock }),
    }).then(() => navigate(-1));
  }

  if (!producto) return <div className="container py-4">Cargando...</div>;

  return (
    <div className="container py-4">
      <h2>Editar Stock – {producto.nombre}</h2>

      <p>
        <strong>Código:</strong> {producto.codigo}
      </p>

      <form onSubmit={guardar} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Stock actual</label>
          <input
            type="number"
            className="form-control"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>

        <button className="btn btn-success">Guardar cambios</button>
      </form>
    </div>
  );
}
