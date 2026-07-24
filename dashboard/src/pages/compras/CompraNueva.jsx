import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CompraNueva() {
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState("lavadoras");
  const [productos, setProductos] = useState([]);
  const [productoId, setProductoId] = useState("");

  const [proveedor, setProveedor] = useState("");
  const [factura, setFactura] = useState("");
  const [notas, setNotas] = useState("");

  const [cantidad, setCantidad] = useState(1);
  const [precio, setPrecio] = useState("");
  const [fecha, setFecha] = useState("");
  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [errorCodigo, setErrorCodigo] = useState("");
  const [sugerencias, setSugerencias] = useState([]);

  // Cargar productos según categoría
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/productos?categoria=${categoria}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProductos(data);
        } else if (data && Array.isArray(data.productos)) {
          setProductos(data.productos);
        } else {
          console.error("ERROR: Backend no devolvió un array:", data);
          setProductos([]);
        }
      });
  }, [categoria]);

  function buscarProductoPorCodigo() {
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/productos/buscar/${codigoBusqueda}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setErrorCodigo("Código no encontrado");
          return;
        }

        setErrorCodigo("");
        setProductoId(data.id);
      });
  }

  function handleCodigoChange(e) {
    const value = e.target.value.toUpperCase();
    setCodigoBusqueda(value);

    if (value.length === 0) {
      setSugerencias([]);
      return;
    }

    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/productos/buscar?q=${value}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0) {
          setErrorCodigo("No results");
          setSugerencias([]);
        } else {
          setErrorCodigo("");
          setSugerencias(data);
        }
      });
  }

  function seleccionarProducto(producto) {
    setProductoId(producto.id);
    setCodigoBusqueda(producto.codigo);
    setSugerencias([]);
  }

  function guardarCompra(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/compras`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        categoria,
        producto_id: productoId,
        cantidad,
        precio,
        fecha,
        proveedor,
        factura,
        notas,
      }),
    }).then(() => navigate(-1)); // volver atrás
  }

  return (
    <div className="container py-4">
      <h2>Nueva Compra</h2>

      <form onSubmit={guardarCompra} className="mt-3">
        {/* Categoría */}
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

        <div className="mb-3 position-relative">
          <label className="form-label">Search by code</label>
          <input
            className="form-control"
            value={codigoBusqueda}
            onChange={handleCodigoChange}
            placeholder="Type product code..."
          />

          {sugerencias.length > 0 && (
            <ul
              className="list-group position-absolute w-100"
              style={{ zIndex: 10 }}
            >
              {sugerencias.map((s) => (
                <li
                  key={s.id}
                  className="list-group-item list-group-item-action"
                  onClick={() => seleccionarProducto(s)}
                >
                  <strong>{s.codigo}</strong> — {s.nombre}
                </li>
              ))}
            </ul>
          )}

          {errorCodigo && <small className="text-danger">{errorCodigo}</small>}
        </div>

        {/* Producto */}
        <div className="mb-3">
          <label className="form-label">Producto</label>
          <select
            className="form-select"
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
          >
            <option value="">Selecciona un producto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Proveedor */}
        <div className="mb-3">
          <label className="form-label">Proveedor</label>
          <input
            className="form-control"
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
          />
        </div>

        {/* Número de factura */}
        <div className="mb-3">
          <label className="form-label">Número de factura</label>
          <input
            className="form-control"
            value={factura}
            onChange={(e) => setFactura(e.target.value)}
          />
        </div>

        {/* Notas */}
        <div className="mb-3">
          <label className="form-label">Notas</label>
          <textarea
            className="form-control"
            rows="3"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          ></textarea>
        </div>

        {/* Cantidad */}
        <div className="mb-3">
          <label className="form-label">Cantidad</label>
          <input
            type="number"
            className="form-control"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </div>

        {/* Precio */}
        <div className="mb-3">
          <label className="form-label">Precio (€)</label>
          <input
            type="number"
            className="form-control"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
        </div>

        {/* Fecha */}
        <div className="mb-3">
          <label className="form-label">Fecha</label>
          <input
            type="date"
            className="form-control"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <button className="btn btn-warning">Guardar Compra</button>
      </form>
    </div>
  );
}
