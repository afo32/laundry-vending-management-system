import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InventarioNuevo() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("lavadoras");
  const [stock, setStock] = useState(0);
  const [precio, setPrecio] = useState("");
  const [codigo, setCodigo] = useState("");
  const [subcategoria, setSubcategoria] = useState("");

  function guardar(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:5000/productos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        nombre,
        categoria,
        subcategoria,
        stock,
        precio,
      }),
    }).then(() => navigate(-1));
  }

  return (
    <div className="container py-4">
      <h2>Nuevo Producto</h2>
      <div className="mb-3">
        <label className="form-label">Categoría</label>
        <select
          className="form-select"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="lavadoras">Lavadoras</option>
          <option value="vending">Vending</option>
        </select>
      </div>

      {categoria === "vending" && (
        <div className="mb-3">
          <label className="form-label">Subcategoría</label>
          <select
            className="form-select"
            value={subcategoria}
            onChange={(e) => setSubcategoria(e.target.value)}
          >
            <option value="bebida">Bebida</option>
            <option value="chuches">Chuches</option>
            <option value="parafarmacia">Parafarmacia</option>
            <option value="fumar">Fumar</option>
            <option value="cafetera">Cafetera</option>
          </select>
        </div>
      )}

      <form onSubmit={guardar} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Nombre del producto</label>
          <input
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Código del producto</label>
          <input
            className="form-control"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Stock inicial</label>
          <input
            type="number"
            className="form-control"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Precio (€)</label>
          <input
            type="number"
            className="form-control"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
        </div>

        <button className="btn btn-success">Guardar Producto</button>
      </form>
    </div>
  );
}
