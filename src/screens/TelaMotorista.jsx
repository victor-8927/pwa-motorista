import { useState, useEffect, useRef } from "react"
import ChecklistSaida   from "../components/ChecklistSaida"
import ChecklistRetorno from "../components/ChecklistRetorno"
import { api } from "../services/api"
import styles from "./TelaMotorista.module.css"

const MOTORISTA = { nome: "Jean Pinto" }

const MOCK_VEHICLE = {
  id: "v-mock", sequence: 1, rota: "ROTA 802", vda: "VDA 80",
  vehicle_type: "toco", capacity_kg: 8800,
  motorista_name: "Jean Pinto", state: "liberado_portaria",
}

const STEPS = [
  { key: "saida",   label: "Saída",   icon: "🚛" },
  { key: "rota",    label: "Em rota", icon: "🛣️" },
  { key: "retorno", label: "Retorno", icon: "🏭" },
  { key: "fim",     label: "Fim",     icon: "✅" },
]

function formatTimer(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, "0")
  const s = String(secs % 60).padStart(2, "0")
  return `${m}:${s}`
}

export default function TelaMotorista() {
  const [vehicle, setVehicle]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [fase, setFase]             = useState("checklist_saida")
  const [saidaData, setSaidaData]   = useState(null)
  const [abastTimer, setAbastTimer] = useState(0)
  const [abastecendo, setAbastecendo] = useState(false)
  const [kmSaida, setKmSaida]       = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    api.getMeuVeiculo(MOTORISTA.nome)
      .then(v => setVehicle(v || MOCK_VEHICLE))
      .catch(() => setVehicle(MOCK_VEHICLE))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (abastecendo) {
      timerRef.current = setInterval(() => setAbastTimer(t => t + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [abastecendo])

  const handleSaida = async (data) => {
    setSaidaData(data)
    try { await api.registrarSaida(vehicle.id, MOTORISTA.nome, data.kmSaida) } catch {}
    setKmSaida(data.kmSaida)
    if (data.abastece) {
      try { await api.iniciarAbastecimento(vehicle.id, MOTORISTA.nome) } catch {}
      setAbastecendo(true)
      setFase("abastecendo")
    } else {
      setFase("em_rota")
    }
  }

  const handleFinalizarAbast = async () => {
    try { await api.finalizarAbastecimento(vehicle.id, MOTORISTA.nome) } catch {}
    setAbastecendo(false)
    setFase("em_rota")
  }

  const handleChegou = () => setFase("checklist_retorno")

  const handleRetorno = async (data) => {
    try { await api.registrarRetorno(vehicle.id, MOTORISTA.nome, data.kmRetorno) } catch {}
    setFase("finalizado")
  }

  if (loading) return (
    <div className={styles.center}>
      <div style={{fontSize:32}}>🧊</div>
      <div className={styles.loadingTxt}>Carregando sua rota...</div>
    </div>
  )

  if (fase === "checklist_saida")   return <ChecklistSaida vehicle={vehicle} onConcluir={handleSaida} />
  if (fase === "checklist_retorno") return <ChecklistRetorno vehicle={vehicle} saidaData={saidaData} onConcluir={handleRetorno} />

  if (fase === "abastecendo") {
    const urgente = abastTimer > 540
    return (
      <div className={styles.center}>
        <div className={styles.abastTitle}>⛽ Abastecendo</div>
        <div className={styles.abastSub}>{vehicle.vda} · {MOTORISTA.nome}</div>
        <div className={`${styles.abastTimer} ${urgente ? styles.abastTimerUrg : ""}`}>
          <div className={`${styles.abastVal} ${urgente ? styles.abastValUrg : ""}`}>
            {formatTimer(abastTimer)}
          </div>
          <div className={styles.abastLabel}>
            {urgente ? "⚠️ SLA quase excedido!" : "Tempo de abastecimento"}
          </div>
        </div>
        <button className={styles.btnAbast} onClick={handleFinalizarAbast}>
          ✓ Abastecimento concluído
        </button>
      </div>
    )
  }

  if (fase === "finalizado") return (
    <div className={styles.center}>
      <div style={{fontSize:52}}>✅</div>
      <div className={styles.finTitle}>Rota concluída!</div>
      <div className={styles.finSub}>Bom trabalho, {MOTORISTA.nome}.</div>
    </div>
  )

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.vda}>{vehicle.vda}</div>
        <div className={styles.meta}>{vehicle.rota} · {MOTORISTA.nome}</div>
      </div>

      <div className={styles.steps}>
        {STEPS.map((s, i) => {
          const done   = fase === "finalizado"
          const active = fase === "em_rota" && i === 1
          return (
            <div key={s.key} className={styles.step}>
              <div className={`${styles.stepDot} ${done ? styles.stepDone : ""} ${active ? styles.stepActive : ""}`}>
                {done ? "✓" : s.icon}
              </div>
              <div className={`${styles.stepLabel} ${(done||active) ? styles.stepLabelOn : ""}`}>{s.label}</div>
              {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${done ? styles.stepLineDone : ""}`} />}
            </div>
          )
        })}
      </div>

      {kmSaida && (
        <div className={styles.infoCard}>
          <span>KM saída</span>
          <strong>{kmSaida?.toLocaleString("pt-BR")}</strong>
        </div>
      )}

      <button className={styles.btnChegou} onClick={handleChegou}>
        🏭 Cheguei na empresa
      </button>
    </div>
  )
}
