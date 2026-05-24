import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function VentasPorDiaCategoria() {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:5000/reportes/ventas-dia?categoria=${categoria}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => setVentas(data));
  }, [categoria]);

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-capitalize">Ventas por Día — {categoria}</h2>

      <button
        className="btn btn-success mb-3"
        onClick={() => navigate("/ventas/nueva", { state: { categoria } })}
      >
        ➕ Nueva Venta
      </button>

      {ventas.length === 0 ? (
        <p>No hay ventas registradas.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cantidad</th>
              <th>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v, i) => (
              <tr key={i}>
                <td>{v.fecha}</td>
                <td>{v.cantidad}</td>
                <td>{v.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
