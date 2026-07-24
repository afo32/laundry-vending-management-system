import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="container py-5">
      <h1 className="mb-4">Panel de Control</h1>

      <div className="row g-4">
        {/* Ventas */}
        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <h4>Ventas</h4>
            <button
              className="btn btn-primary w-100 mt-2"
              onClick={() => navigate("/reportes/ventas-dia")}
            >
              Ventas por Día
            </button>

            <button
              className="btn btn-primary w-100 mt-2"
              onClick={() => navigate("/reportes/ventas-maquina")}
            >
              Ventas por Máquina
            </button>

            <button
              className="btn btn-primary w-100 mt-2"
              onClick={() => navigate("/reportes/ventas-producto")}
            >
              Ventas por Producto
            </button>
          </div>
        </div>

        {/* Compras */}
        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <h4>Compras</h4>
            <button
              className="btn btn-warning w-100 mt-2"
              onClick={() => navigate("/reportes/compras-mes")}
            >
              Compras por Mes
            </button>
          </div>
        </div>

        {/* Gastos */}
        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <h4>Gastos</h4>
            <button
              className="btn btn-danger w-100 mt-2"
              onClick={() => navigate("/reportes/gastos")}
            >
              Gestión de Gastos
            </button>
          </div>
        </div>

        {/* Inventario */}
        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <h4>Inventario</h4>
            <button
              className="btn btn-success w-100 mt-2"
              onClick={() => navigate("/inventario")}
            >
              Inventario General
            </button>
          </div>
        </div>
        {/* Caja */}
        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <h4>Caja</h4>
            <button
              className="btn btn-info w-100 mt-2 text-white"
              onClick={() => navigate("/caja")}
            >
              Ver Caja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
