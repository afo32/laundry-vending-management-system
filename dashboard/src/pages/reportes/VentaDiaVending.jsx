import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ReportesVentasDia() {
  const { categoria } = useParams();
  const navigate = useNavigate();

  const [dias, setDias] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:5000/ventas/dia?categoria=${categoria}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setDias(Array.isArray(data) ? data : []));
  }, [categoria]);

  return (
    <div className="container py-4">
      <h2>Días de venta — {categoria}</h2>

      <button
        className="btn btn-success mb-3"
        onClick={() => navigate("/ventas/dia/nuevo", { state: { categoria } })}
      >
        Crear día
      </button>

      {dias.length === 0 ? (
        <p>No hay días registrados.</p>
      ) : (
        <ul className="list-group">
          {dias.map((d) => (
            <li
              key={d.id}
              className="list-group-item d-flex justify-content-between"
            >
              <span>{d.fecha}</span>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/ventas/dia/${d.id}`)}
              >
                Entrar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
