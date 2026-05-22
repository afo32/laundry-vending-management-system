import { useEffect, useState } from "react";
import { fetchReporte } from "../../api/reportes";
import BotonNuevaCompra from "../../components/BotonNuevaCompra";

export default function ComprasPorMesVending() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetchReporte("compras-mes?categoria=vending", token).then((res) =>
      setData(res),
    );
  }, []);

  return (
    <div className="container py-4">
      <h2>Compras por Mes – Vending</h2>
      <BotonNuevaCompra />

      <pre className="mt-3">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
