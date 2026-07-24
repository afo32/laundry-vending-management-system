const API_URL = `${import.meta.env.VITE_API_URL}`;

export async function fetchReporte(endpoint, token) {
  const res = await fetch(`${API_URL}/reportes/${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });

  return res.json();
}
