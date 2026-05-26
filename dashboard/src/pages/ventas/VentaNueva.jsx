import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function VentaNueva() {
  const navigate = useNavigate();
  const location = useLocation();

  // Categoría viene desde navigate()
  const categoria = location.state?.categoria;

  const diaId = location.state?.dia_id;

  const [productos, setProductos] = useState([]);
  const [productoId, setProductoId] = useState("");

  const [maquinas, setMaquinas] = useState([]); // ← LISTA REAL DE MÁQUINAS
  const [maquinaId, setMaquinaId] = useState(""); // ← ID REAL DE LA MÁQUINA

  const [cantidad, setCantidad] = useState(1);
  const [precio, setPrecio] = useState("");
  const [fecha, setFecha] = useState("");

  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [errorCodigo, setErrorCodigo] = useState("");
  const [sugerencias, setSugerencias] = useState([]);

  // Cargar productos SOLO si es vending
  useEffect(() => {
    if (categoria !== "vending") return;

    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:5000/productos?categoria=vending`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []));
  }, [categoria]);

  // Cargar máquinas reales desde el backend
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:5000/maquinas?tipo=${categoria}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setMaquinas(Array.isArray(data) ? data : []));
  }, [categoria]);

  function handleCodigoChange(e) {
    const value = e.target.value.toUpperCase();
    setCodigoBusqueda(value);

    if (value.length === 0) {
      setSugerencias([]);
      return;
    }

    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:5000/productos/buscar?q=${value}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setSugerencias([]);
          return;
        }
        setErrorCodigo("");
        setSugerencias(data);
      });
  }

  function seleccionarProducto(producto) {
    setProductoId(producto.id);
    setCodigoBusqueda(producto.codigo);
    setSugerencias([]);
  }

  function guardarVenta(e) {
    e.preventDefault();

    if (!maquinaId) {
      alert("Debes seleccionar una máquina");
      return;
    }

    const token = localStorage.getItem("token");

    // PRIMERO declaramos body
    const body = {
      cantidad: Number(cantidad),
      precio: Number(precio),
      fecha: fecha || new Date().toISOString().slice(0, 10),
      maquina_id: maquinaId,
      dia_id: diaId,
    };

    // LUEGO añadimos producto_id según categoría
    if (categoria === "vending") {
      body.producto_id = Number(productoId);
    } else {
      body.producto_id = null;
    }

    fetch("http://127.0.0.1:5000/ventas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then(() => navigate(`/ventas/dia/${diaId}`));
  }

  return (
    <div className="container py-4">
      <h2>Nueva Venta</h2>

      <p>
        <strong>Categoría:</strong> {categoria}
      </p>

      <form onSubmit={guardarVenta} className="mt-3">
        {/* Producto SOLO si es vending */}
        {categoria === "vending" && (
          <>
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

            <div className="mb-3 position-relative">
              <label className="form-label">Buscar por código</label>
              <input
                className="form-control"
                value={codigoBusqueda}
                onChange={handleCodigoChange}
                placeholder="Escribe el código..."
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

              {errorCodigo && (
                <small className="text-danger">{errorCodigo}</small>
              )}
            </div>
          </>
        )}

        {/* Máquina */}
        <div className="mb-3">
          <label className="form-label">Máquina</label>
          <select
            className="form-select"
            value={maquinaId}
            onChange={(e) => setMaquinaId(Number(e.target.value))}
          >
            <option value="">Selecciona una máquina</option>

            {maquinas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
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

        <button className="btn btn-success">Guardar Venta</button>
      </form>
    </div>
  );
}
