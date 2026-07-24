import { useNavigate } from "react-router-dom";

export default function Caja() {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <h2 className="mb-4">Caja</h2>

      <div className="row g-3">
        <div className="col-md-6">
          <div
            className="card h-100 border-info"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/caja/maquinas")}
          >
            <div className="card-body text-center py-4">
              <div style={{ fontSize: "2rem" }}>🏧</div>
              <h5 className="mt-2">Cajas Máquinas</h5>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div
            className="card h-100 border-success"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/caja/ganancia")}
          >
            <div className="card-body text-center py-4">
              <div style={{ fontSize: "2rem" }}>📈</div>
              <h5 className="mt-2">Ganancia</h5>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card h-100 border-warning"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/caja/cambio")}
          >
            <div className="card-body text-center py-4">
              <div style={{ fontSize: "2rem" }}>💱</div>
              <h5 className="mt-2">Cambio</h5>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card h-100 border-primary"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/caja/diario")}
          >
            <div className="card-body text-center py-4">
              <div style={{ fontSize: "2rem" }}>📅</div>
              <h5 className="mt-2">Diario</h5>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card h-100 border-secondary"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/caja/trimestral")}
          >
            <div className="card-body text-center py-4">
              <div style={{ fontSize: "2rem" }}>📊</div>
              <h5 className="mt-2">Trimestral</h5>
            </div>
          </div>
        </div>
        <div
          className="card h-100 border-info"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/caja/maquinas-resumen")}
        >
          <div className="card-body text-center py-4">
            <div style={{ fontSize: "2rem" }}>📋</div>
            <h5 className="mt-2">Resumen Máquinas</h5>
          </div>
        </div>
      </div>
    </div>
  );
}
