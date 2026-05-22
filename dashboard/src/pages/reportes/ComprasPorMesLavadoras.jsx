import { useEffect, useState } from "react";
import { fetchReporte } from "../../api/reportes";
import BotonNuevaCompra from "../../components/BotonNuevaCompra";

export default function ComprasPorMesLavadoras() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetchReporte("compras-mes?categoria=lavadoras", token).then((res) =>
      setData(res),
    );
  }, []);

  return (
    <div className="container py-4">
      <h2>Compras por Mes – Lavadoras</h2>
      <BotonNuevaCompra />

      <pre className="mt-3">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
