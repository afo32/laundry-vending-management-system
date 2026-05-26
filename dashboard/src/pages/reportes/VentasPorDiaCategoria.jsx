import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function VentasPorDiaCategoria() {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [fecha, setFecha] = useState(""); // ← NUEVO

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const queryFecha = fecha ? `&fecha=${fecha}` : "";

    fetch(
      `http://127.0.0.1:5000/reportes/ventas-dia?categoria=${categoria}${queryFecha}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setVentas([]);
          return;
        }
        setVentas(data);
      });
  }, [categoria, fecha]); // ← recargar cuando cambie la fecha

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-capitalize">Ventas por Día — {categoria}</h2>

      {/* Selector de fecha */}
      <div className="mb-3">
        <label className="form-label">Seleccionar fecha</label>
        <input
          type="date"
          className="form-control"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      {ventas.length === 0 ? (
        <p>No hay ventas registradas para esta fecha.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v, i) => (
              <tr key={i}>
                <td>{v.fecha}</td>
                <td>{v.producto_nombre || "—"}</td>
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
