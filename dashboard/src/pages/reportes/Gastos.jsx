import { useNavigate } from "react-router-dom";

export default function Gastos() {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <h2 className="mb-4">Gastos</h2>

      <div className="d-flex gap-2 mb-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/gastos/pagos-prestamo")}
        >
          Pagos Préstamo
        </button>
        <button
          className="btn btn-info text-white"
          onClick={() => navigate("/gastos/mensuales")}
        >
          Gastos Mensuales
        </button>
        <button
          className="btn btn-warning text-white"
          onClick={() => navigate("/gastos/merma")}
        >
          Merma
        </button>
      </div>
    </div>
  );
}
