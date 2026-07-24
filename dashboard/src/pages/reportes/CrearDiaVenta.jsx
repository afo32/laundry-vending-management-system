import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function CrearDiaVenta() {
  const navigate = useNavigate();
  const location = useLocation();

  const categoria = location.state?.categoria;
  const [fecha, setFecha] = useState("");

  function crearDia() {
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/ventas/dia`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ fecha, categoria }),
    })
      .then((res) => res.json())
      .then((data) => navigate(`/ventas/dia/${data.id}`));
  }

  return (
    <div className="container py-4">
      <h2>Crear día de ventas — {categoria}</h2>

      <label className="form-label">Fecha</label>
      <input
        type="date"
        className="form-control mb-3"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />

      <button className="btn btn-success" onClick={crearDia}>
        Crear día
      </button>
    </div>
  );
}
