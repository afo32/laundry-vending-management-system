import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InventarioNuevo() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("lavanderia");
  const [stock, setStock] = useState(0);
  const [precioCompra, setPrecioCompra] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [error, setError] = useState("");

  function guardar(e) {
    e.preventDefault();
    setError("");

    if (!nombre) {
      setError("El nombre es obligatorio");
      return;
    }
    if (categoria === "vending" && !subcategoria) {
      setError("Seleccioná una subcategoría");
      return;
    }
    const token = localStorage.getItem("token");

    const body = {
      nombre,
      categoria,
      subcategoria,
      stock: Number(stock),
    };

    if (categoria === "vending") {
      body.precio_compra = Number(precioCompra) || 0;
    }

    fetch(`${import.meta.env.VITE_API_URL}/productos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        navigate(-1);
      });
  }

  return (
    <div className="container py-4" style={{ maxWidth: 480 }}>
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </button>
      <h2 className="mb-4">Nuevo Producto</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={guardar}>
        {/* Categoría */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Categoría</label>
          <select
            className="form-select"
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value);
              setSubcategoria("");
            }}
          >
            <option value="lavanderia">Lavandería</option>
            <option value="vending">Vending</option>
          </select>
        </div>

        {/* Subcategoría — solo vending */}
        {categoria === "vending" && (
          <div className="mb-3">
            <label className="form-label fw-semibold">Subcategoría</label>
            <select
              className="form-select"
              value={subcategoria}
              onChange={(e) => setSubcategoria(e.target.value)}
            >
              <option value="">Seleccioná una subcategoría</option>
              <option value="bebidas">Bebidas</option>
              <option value="chuches">Chuches</option>
              <option value="parafarmacia">Parafarmacia</option>
              <option value="fumar">Fumar</option>
              <option value="cafetera">Cafetera</option>
            </select>
          </div>
        )}

        {/* Nombre */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Nombre del producto</label>
          <input
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        {/* Stock — solo vending */}
        {categoria === "vending" && (
          <div className="mb-3">
            <label className="form-label fw-semibold">Stock inicial</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
        )}

        {/* Precio compra — solo vending */}
        {categoria === "vending" && (
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Precio de compra (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              value={precioCompra}
              onChange={(e) => setPrecioCompra(e.target.value)}
            />
            <div className="form-text">Lo que te cuesta a vos el producto.</div>
          </div>
        )}

        <button type="submit" className="btn btn-success w-100">
          Guardar Producto
        </button>
      </form>
    </div>
  );
}
