import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [stock, setStock] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token")?.replace(/"/g, "");

    fetch(`http://127.0.0.1:5000/productos/${id}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((p) => {
        setNombre(p.nombre || "");
        setCodigo(p.codigo || "");
        setSubcategoria(p.subcategoria || "");
        setStock(p.stock ?? 0);
      });
  }, [id]);

  function guardarCambios(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const body = {
      nombre,
      codigo,
      subcategoria,
      stock: Number(stock),
    };

    fetch(`http://127.0.0.1:5000/productos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then(() => navigate("/inventario/vending"));
  }

  return (
    <div className="container py-4">
      <h2>Editar Producto</h2>

      <form onSubmit={guardarCambios} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Código</label>
          <input
            className="form-control"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Subcategoría</label>
          <select
            className="form-select"
            value={subcategoria}
            onChange={(e) => setSubcategoria(e.target.value)}
          >
            <option value="bebidas">Bebidas</option>
            <option value="chuches">Chuches</option>
            <option value="parafarmacia">Parafarmacia</option>
            <option value="fumar">Fumar</option>
            <option value="cafetera">Cafetera</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Stock</label>
          <input
            type="number"
            className="form-control"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>

        <button className="btn btn-primary">Guardar cambios</button>
      </form>
    </div>
  );
}
