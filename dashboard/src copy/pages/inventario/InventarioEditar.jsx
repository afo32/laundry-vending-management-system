import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/productos/${id}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((p) => {
        setNombre(p.nombre || "");
        setPrecio(p.precio ?? "");
        setPrecioCompra(p.precio_compra ?? "");
        setCategoria(p.categoria || "");
        setCargando(false);
      });
  }, [id]);

  function volver() {
    if (categoria === "lavanderia") navigate("/inventario/lavadoras");
    else navigate("/inventario/vending");
  }

  async function guardarCambios(e) {
    e.preventDefault();
    setError("");

    if (!precio || Number(precio) <= 0) {
      setError("El precio de venta debe ser mayor que 0");
      return;
    }

    setGuardando(true);

    const body = { nombre, precio: Number(precio) };
    if (categoria === "vending") {
      body.precio_compra = Number(precioCompra);
    }

    const res = await fetch(`http://127.0.0.1:5000/productos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      volver();
    } else {
      setError("Error al guardar");
      setGuardando(false);
    }
  }

  if (cargando) return <div className="container py-4">Cargando...</div>;

  return (
    <div className="container py-4" style={{ maxWidth: 480 }}>
      <button className="btn btn-link p-0 text-secondary mb-2" onClick={volver}>
        ← Volver
      </button>
      <h2 className="mb-4">Editar — {nombre}</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={guardarCambios}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Nombre</label>
          <input
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

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

        <div className="mb-4">
          <label className="form-label fw-semibold">
            {categoria === "vending" ? "Precio de venta (€)" : "Precio (€)"}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="form-control"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
          <div className="form-text">
            El nuevo precio solo aplica a ventas futuras.
          </div>
        </div>

        {/* Margen — solo vending, solo si ambos precios tienen valor */}
        {categoria === "vending" &&
          Number(precio) > 0 &&
          Number(precioCompra) > 0 && (
            <div className="alert alert-info py-2 mb-4">
              Margen:{" "}
              <strong>
                {(
                  ((Number(precio) - Number(precioCompra)) / Number(precio)) *
                  100
                ).toFixed(1)}
                %
              </strong>{" "}
              · Beneficio por unidad:{" "}
              <strong>
                {(Number(precio) - Number(precioCompra)).toFixed(2)} €
              </strong>
            </div>
          )}

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
