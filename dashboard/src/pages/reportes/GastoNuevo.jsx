import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GastoNuevo() {
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [importe, setImporte] = useState("");
  const navigate = useNavigate();

  function guardar(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/gastos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ descripcion, categoria, importe }),
    }).then(() => navigate("/reportes/gastos"));
  }

  return (
    <div className="container py-4">
      <h2>Nuevo Gasto</h2>

      <form onSubmit={guardar} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <input
            className="form-control"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Categoría</label>
          <input
            className="form-control"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Importe (€)</label>
          <input
            type="number"
            className="form-control"
            value={importe}
            onChange={(e) => setImporte(e.target.value)}
          />
        </div>

        <button className="btn btn-success">Guardar</button>
      </form>
    </div>
  );
}
