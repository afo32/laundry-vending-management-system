import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function DiaVenta() {
  const { diaId } = useParams();
  const navigate = useNavigate();

  const [dia, setDia] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/ventas/dia/${diaId}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setDia(data));
  }, [diaId]);

  if (!dia) return <p>Cargando...</p>;

  return (
    <div className="container py-4">
      <h2>Ventas del día {dia.fecha}</h2>
      <p>Categoría: {dia.categoria}</p>

      <button
        className="btn btn-success mb-3"
        onClick={() =>
          navigate("/ventas/nueva", {
            state: { categoria: dia.categoria, dia_id: dia.id },
          })
        }
      >
        Añadir producto
      </button>

      {dia.ventas.length === 0 ? (
        <p>No hay ventas registradas.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {dia.ventas.map((v) => (
              <tr key={v.id}>
                <td>{v.producto_nombre}</td>
                <td>{v.cantidad}</td>
                <td>{v.precio} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
