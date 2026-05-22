import { useEffect, useState } from "react";
import { fetchReporte } from "../../api/reportes";
import BotonNuevaVenta from "../../components/BotonNuevaVenta";

export default function VentasPorDiaVending() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetchReporte("ventas-dia?categoria=vending", token).then((res) =>
      setData(res),
    );
  }, []);

  return (
    <div className="container py-4">
      <h2>Ventas por Día – Vending</h2>

      <BotonNuevaVenta />

      <pre className="mt-3">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
