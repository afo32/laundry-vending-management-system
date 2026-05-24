import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VentaNueva() {
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState("lavadoras");
  const [productos, setProductos] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [maquinaId, setMaquinaId] = useState("");
  const [maquina, setMaquina] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [precio, setPrecio] = useState("");
  const [fecha, setFecha] = useState("");
  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [errorCodigo, setErrorCodigo] = useState("");
  const [sugerencias, setSugerencias] = useState([]);

  const maquinasLavadoras = ["L1", "L2", "L3", "S1", "S2", "IS1", "IS2"];
  const maquinasVending = ["Cafetera", "Comida"];

  // Cargar productos según categoría
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:5000/productos?categoria=${categoria}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("RESPUESTA PRODUCTOS:", data);
        setProductos(
          Array.isArray(data)
            ? data
            : Array.isArray(data.productos)
              ? data.productos
              : [],
        );
      })
      .catch((err) => console.error("ERROR FETCH:", err));
  }, [categoria]);

  function buscarProductoPorCodigo() {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:5000/productos/buscar/${codigoBusqueda}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setErrorCodigo("Código no encontrado");
          return;
        }

        setErrorCodigo("");
        setProductoId(data.id); // selecciona el producto automáticamente
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

    fetch(`http://127.0.0.1:5000/productos/buscar?q=${value}`, {
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
    setMaquinaId(maquina.id);
  }

  function guardarVenta() {
    const token = localStorage.getItem("token");

    const body = {
      cantidad: Number(cantidad),
      precio: Number(precio),
      fecha: new Date().toISOString().slice(0, 10),
    };

    if (categoria === "vending") {
      body.producto_id = Number(productoId); // <--- ENTERO
      body.maquina_id = 1;
    }

    if (categoria === "lavadoras") {
      body.producto_id = null; // <--- NULL
      body.maquina_id = 1;
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
      .then(() => {
        navigate(`/reportes/ventas-dia/${categoria}`);
      });
  }

  return (
    <div className="container py-4">
      <h2>Nueva Venta</h2>

      <form onSubmit={guardarVenta} className="mt-3">
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

        {/* Máquina */}
        <div className="mb-3">
          <label className="form-label">Máquina</label>
          <select
            className="form-select"
            value={maquina}
            onChange={(e) => setMaquina(e.target.value)}
          >
            <option value="">Selecciona una máquina</option>

            {(categoria === "lavadoras"
              ? maquinasLavadoras
              : maquinasVending
            ).map((m) => (
              <option key={m} value={m}>
                {m}
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
