import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:5000/gastos", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setGastos(data));
  }, []);

  function eliminarGasto(id) {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:5000/gastos/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    }).then(() => {
      setGastos((prev) => prev.filter((g) => g.id !== id));
    });
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">Gastos</h2>

      <button
        className="btn btn-success mb-3"
        onClick={() => navigate("/reportes/gastos/nuevo")}
      >
        + Nuevo gasto
      </button>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Importe</th>
            <th>Fecha</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {gastos.map((g) => (
            <tr key={g.id}>
              <td>{g.descripcion}</td>
              <td>{g.categoria}</td>
              <td>{g.importe} €</td>
              <td>{g.fecha}</td>
              <td className="text-end">
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => navigate(`/reportes/gastos/${g.id}/editar`)}
                >
                  Editar
                </button>

                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => eliminarGasto(g.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
