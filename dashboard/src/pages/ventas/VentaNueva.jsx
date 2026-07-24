import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const FILA_VACIA = { producto_id: "", cantidad: 1, precio: "" };

export default function VentaNueva() {
  const navigate = useNavigate();
  const location = useLocation();
  const categoria = location.state?.categoria;

  const hoy = new Date().toISOString().split("T")[0];

  const [fecha, setFecha] = useState(hoy);
  const [maquinaId, setMaquinaId] = useState("");
  const [maquinas, setMaquinas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filas, setFilas] = useState([{ ...FILA_VACIA }]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Cargar máquinas (solo vending las necesita)
  useEffect(() => {
    if (categoria !== "vending") return;
    fetch(`${import.meta.env.VITE_API_URL}/maquinas?tipo=${categoria}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((r) => r.json())
      .then((d) => setMaquinas(Array.isArray(d) ? d : []));
  }, [categoria]);

  // Cargar productos según categoría — vending carga vending + cafe juntos
  useEffect(() => {
    const categorias =
      categoria === "vending" ? ["vending", "cafe"] : [categoria];

    Promise.all(
      categorias.map((cat) =>
        fetch(`${import.meta.env.VITE_API_URL}/productos?categoria=${cat}`, {
          headers: { Authorization: "Bearer " + token },
        }).then((r) => r.json()),
      ),
    ).then((resultados) => {
      const todos = resultados.flat();
      setProductos(Array.isArray(todos) ? todos : []);
    });
  }, [categoria]);

  function actualizarFila(index, campo, valor) {
    const nuevas = [...filas];
    nuevas[index] = { ...nuevas[index], [campo]: valor };

    if (campo === "producto_id" && valor) {
      const prod = productos.find((p) => p.id === Number(valor));
      if (prod) nuevas[index].precio = prod.precio;
    }

    setFilas(nuevas);
  }

  function agregarFila() {
    setFilas([...filas, { ...FILA_VACIA }]);
  }

  function quitarFila(index) {
    if (filas.length === 1) return;
    setFilas(filas.filter((_, i) => i !== index));
  }

  const totalGeneral = filas.reduce((acc, f) => {
    return acc + (Number(f.cantidad) || 0) * (Number(f.precio) || 0);
  }, 0);

  async function guardar(e) {
    e.preventDefault();
    setError("");

    if (categoria === "vending" && !maquinaId) {
      setError("Seleccioná una máquina");
      return;
    }
    if (!fecha) {
      setError("Seleccioná una fecha");
      return;
    }

    for (let i = 0; i < filas.length; i++) {
      const f = filas[i];
      if (!f.producto_id) {
        setError(`Fila ${i + 1}: seleccioná un producto`);
        return;
      }
      if (!f.cantidad || Number(f.cantidad) <= 0) {
        setError(`Fila ${i + 1}: cantidad inválida`);
        return;
      }
      if (!f.precio || Number(f.precio) <= 0) {
        setError(`Fila ${i + 1}: precio inválido`);
        return;
      }
    }

    setGuardando(true);

    const body = {
      fecha,
      categoria,
      maquina_id: categoria === "vending" ? Number(maquinaId) : null,
      items: filas.map((f) => ({
        producto_id: Number(f.producto_id),
        cantidad: Number(f.cantidad),
        precio: Number(f.precio),
      })),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/ventas/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Error al guardar");
        return;
      }

      navigate(`/reportes/ventas-dia/${categoria}`);
    } catch (e) {
      setError("Error de conexión con el servidor");
    } finally {
      setGuardando(false);
    }
  }

  // Agrupar productos por categoría para el select
  const vendingProductos = productos.filter((p) => p.categoria === "vending");
  const cafeProductos = productos.filter((p) => p.categoria === "cafe");

  return (
    <div className="container py-4">
      <button
        className="btn btn-link p-0 text-secondary mb-2"
        onClick={() => navigate(`/reportes/ventas-dia/${categoria}`)}
      >
        ← Volver
      </button>
      <h2 className="mb-4 text-capitalize">Nueva Venta — {categoria}</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={guardar}>
        {/* Fecha y máquina */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Fecha</label>
            <input
              type="date"
              className="form-control"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          {categoria === "vending" && (
            <div className="col-md-6">
              <label className="form-label fw-semibold">Máquina</label>
              <select
                className="form-select"
                value={maquinaId}
                onChange={(e) => setMaquinaId(e.target.value)}
              >
                <option value="">Seleccioná una máquina</option>
                {maquinas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Filas de productos */}
        <div className="card mb-3">
          <div className="card-body p-0">
            <table className="table mb-0">
              <thead className="table-light">
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio (€)</th>
                  <th className="text-end">Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, i) => (
                  <tr key={i}>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={fila.producto_id}
                        onChange={(e) =>
                          actualizarFila(i, "producto_id", e.target.value)
                        }
                      >
                        <option value="">— Seleccioná —</option>
                        {categoria === "vending" ? (
                          <>
                            {vendingProductos.length > 0 && (
                              <optgroup label="🥤 Vending">
                                {vendingProductos.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.nombre}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            {cafeProductos.length > 0 && (
                              <optgroup label="☕ Café">
                                {cafeProductos.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.nombre}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </>
                        ) : (
                          productos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre}
                            </option>
                          ))
                        )}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={fila.cantidad}
                        min="1"
                        onChange={(e) =>
                          actualizarFila(i, "cantidad", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={fila.precio}
                        step="0.01"
                        min="0"
                        onChange={(e) =>
                          actualizarFila(i, "precio", e.target.value)
                        }
                      />
                    </td>
                    <td className="text-end align-middle">
                      {(
                        (Number(fila.cantidad) || 0) *
                        (Number(fila.precio) || 0)
                      ).toFixed(2)}{" "}
                      €
                    </td>
                    <td className="text-center align-middle">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => quitarFila(i)}
                        disabled={filas.length === 1}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <td colSpan={3} className="fw-semibold">
                    Total
                  </td>
                  <td className="text-end fw-bold text-success">
                    {totalGeneral.toFixed(2)} €
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="d-flex justify-content-between mb-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={agregarFila}
          >
            + Agregar producto
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-success w-100"
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Guardar ventas"}
        </button>
      </form>
    </div>
  );
}
