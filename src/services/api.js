const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  getMeuVeiculo: (motoristaNome) => {
    const today = new Date().toISOString().slice(0, 10)
    return request("GET", `/plans/${today}/vehicles`)
      .then(vehicles => vehicles.find(v =>
        v.motorista_name?.toLowerCase().includes(motoristaNome.toLowerCase())
      ))
  },

  getVolumes: (vehicleId) =>
    request("GET", `/vehicles/${vehicleId}/volumes`),

  registrarSaida: (vehicleId, actorName, kmSaida) =>
    request("POST", `/vehicles/${vehicleId}/saida-portaria`, {
      actorName, km_saida: kmSaida,
    }),

  iniciarAbastecimento: (vehicleId, actorName) =>
    request("POST", `/vehicles/${vehicleId}/abastecimento`, {
      actorName, iniciando: true,
    }),

  finalizarAbastecimento: (vehicleId, actorName) =>
    request("POST", `/vehicles/${vehicleId}/abastecimento`, {
      actorName, iniciando: false,
    }),

  registrarRetorno: (vehicleId, actorName, kmRetorno) =>
    request("POST", `/vehicles/${vehicleId}/retorno`, {
      actorName, km_retorno: kmRetorno,
    }),
}
