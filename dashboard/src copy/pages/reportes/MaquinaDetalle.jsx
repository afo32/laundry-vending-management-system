import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchReporte } from "../../api/reportes";

export default function MaquinaDetalle() {
  const { id } = useParams();
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetchReporte(`ventas-maquina?maquina_id=${id}`, token).then((res) =>
      setData(res),
    );
  }, [id]);

  return (
    <div className="container py-4">
      <h2 className="mb-3">Ventas de la máquina {id}</h2>

      <pre className="mt-3">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
