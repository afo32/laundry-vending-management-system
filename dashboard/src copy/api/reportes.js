const API_URL = "http://127.0.0.1:5000";

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
