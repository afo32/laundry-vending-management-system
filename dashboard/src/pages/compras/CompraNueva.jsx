import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SUBCATEGORIAS = [
  ["bebidas", "Bebidas"],
  ["chuches", "Chuches"],
  ["parafarmacia", "Parafarmacia"],
  ["fumar", "Fumar"],
  ["cafetera", "Cafetera"],
];

export default function CompraNueva() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const hoy = new Date().toISOString().split("T")[0];

  const [categoria, setCategoria] = useState("vending");
  const [subcategoria, setSubcategoria] = useState("");
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [fecha, setFecha] = useState(hoy);
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/productos?categoria=${categoria}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((r) => r.json())
      .then((d) => setProductos(Array.isArray(d) ? d : []));
  }, [categoria]);

  const existente = productos.find(
    (p) => p.nombre.trim().toLowerCase() === nombre.trim().toLowerCase(),
  );

  function elegirNombre(valor) {
    setNombre(valor);
    const p = productos.find(
      (x) => x.nombre.trim().toLowerCase() === valor.trim().toLowerCase(),
    );
    if (p) {
      if (p.subcategoria) setSubcategoria(p.subcategoria);
      if (p.precio_compra) setPrecioCompra(p.precio_compra);
    }
  }

  async function guardar(e) {
    e.preventDefault();
    setError("");

    if (!nombre.trim()) return setError("Escribe el nombre del producto");
    if (categoria === "vending" && !subcategoria)
      return setError("Selecciona una subcategoría");
    if (!cantidad || Number(cantidad) <= 0)
      return setError("Cantidad no válida");
    if (precioCompra === "" || Number(precioCompra) < 0)
      return setError("Precio de compra no válido");

    setGuardando(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/compras/rapida`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            categoria,
            subcategoria,
            nombre: nombre.trim(),
            cantidad: Number(cantidad),
            precio_compra: Number(precioCompra),
            precio_venta: Number(precioVenta) || 0,
            fecha,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al guardar");
        return;
      }
      navigate(-1);
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setGuardando(false);
    }
  }

  const total = (Number(cantidad) || 0) * (Number(precioCompra) || 0);

  return (
    <div className="container py-4" style={{ maxWidth: 520 }}>
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </button>
      <h2 className="mb-4">Nueva compra</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={guardar}>
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
            <option value="vending">Vending</option>
            <option value="lavanderia">Lavandería</option>
          </select>
        </div>

        {categoria === "vending" && (
          <div className="mb-3">
            <label className="form-label fw-semibold">Subcategoría</label>
            <select
              className="form-select"
              value={subcategoria}
              onChange={(e) => setSubcategoria(e.target.value)}
            >
              <option value="">Selecciona una subcategoría</option>
              {SUBCATEGORIAS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label fw-semibold">Producto</label>
          <input
            className="form-control"
            list="lista-productos"
            value={nombre}
            placeholder="Escribe o elige un producto existente"
            onChange={(e) => elegirNombre(e.target.value)}
          />
          <datalist id="lista-productos">
            {productos.map((p) => (
              <option key={p.id} value={p.nombre} />
            ))}
          </datalist>
          {nombre.trim() && (
            <div
              className={
                "form-text " + (existente ? "text-success" : "text-warning")
              }
            >
              {existente
                ? `Ya existe (${existente.codigo}), stock actual ${existente.stock}. Se sumará.`
                : "Producto nuevo: se creará en el inventario."}
            </div>
          )}
        </div>

        <div className="row g-3 mb-3">
          <div className="col-6">
            <label className="form-label fw-semibold">Stock a añadir</label>
            <input
              type="number"
              min="1"
              className="form-control"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </div>
          <div className="col-6">
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
          </div>
        </div>

        {!existente && nombre.trim() && (
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Precio de venta (€){" "}
              <span className="text-muted small">opcional</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
            />
          </div>
        )}

        <div className="mb-3">
          <label className="form-label fw-semibold">Fecha</label>
          <input
            type="date"
            className="form-control"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div className="alert alert-info py-2">
          Total de la compra: <strong>{total.toFixed(2)} €</strong>
        </div>

        <button className="btn btn-success w-100" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar compra"}
        </button>
      </form>
    </div>
  );
}
