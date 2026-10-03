import { useState } from "react"
import styles from "./ChecklistSaida.module.css"

function OpcaoBtn({ opcoes, valor, onChange }) {
  return (
    <div className={styles.opcoes}>
      {opcoes.map(o => (
        <button key={o.val}
          className={`${styles.opcao} ${valor === o.val ? (o.cor === "red" ? styles.opcaoRed : o.cor === "amber" ? styles.opcaoAmber : styles.opcaoSel) : ""}`}
          onClick={() => onChange(o.val)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

function ItemRow({ nome, children }) {
  return (
    <div className={styles.itemRow}>
      <span className={styles.itemNome}>{nome}</span>
      {children}
    </div>
  )
}

export default function ChecklistSaida({ vehicle, onConcluir }) {
  const [data, setData]       = useState(new Date().toLocaleDateString("pt-BR"))
  const [rota, setRota]       = useState(vehicle?.rota || "")
  const [patCelular, setPatCelular]     = useState("")
  const [patImpressora, setPatImpressora] = useState("")

  // Celular
  const [bateria, setBateria]     = useState("")
  const [capa, setCapa]           = useState("")
  const [pelicula, setPelicula]   = useState("")
  const [carregador, setCarregador] = useState("")
  const [cabousb, setCabousb]     = useState("")

  // Impressora
  const [impressora, setImpressora]   = useState("")
  const [bobinaMaq, setBobinaMaq]     = useState("")
  const [bobinaExtra, setBobinaExtra] = useState("")

  // Material
  const [carimbo, setCarimbo]     = useState("")
  const [prancheta, setPrancheta] = useState("")
  const [grampeador, setGrampeador] = useState("")
  const [regua, setRegua]         = useState("")
  const [pasta, setPasta]         = useState("")
  const [bolsa, setBolsa]         = useState("")
  const [caneta, setCaneta]       = useState("")

  // Avarias
  const [avarias, setAvarias] = useState("")
  const [erro, setErro]       = useState("")
  const [loading, setLoading] = useState(false)

  const okAus = [{ val: "ok", label: "OK" }, { val: "aus", label: "Ausente", cor: "red" }]
  const bateriaOpts = ["0–25%", "25–50%", "50–75%", "75–100%"]

  const handleConfirmar = () => {
    if (!bateria) { setErro("Informe o nível de bateria do celular."); return }
    if (!capa || !pelicula || !carregador || !cabousb) { setErro("Preencha todos os itens do celular."); return }
    if (!impressora || !bobinaMaq || !bobinaExtra) { setErro("Preencha todos os itens da impressora."); return }
    if (!carimbo || !prancheta || !grampeador || !regua || !pasta || !bolsa || !caneta) {
      setErro("Preencha todos os materiais de expediente."); return
    }
    setErro("")
    setLoading(true)
    onConcluir({
      data, rota, patCelular, patImpressora,
      celular: { bateria, capa, pelicula, carregador, cabousb },
      impressora: { impressora, bobinaMaq, bobinaExtra },
      material: { carimbo, prancheta, grampeador, regua, pasta, bolsa, caneta },
      avarias,
    })
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.title}>Checklist de Equipamentos</div>
        <div className={styles.sub}>Distribuição Diária · {vehicle?.vda} · {vehicle?.motorista_name}</div>
      </div>

      {/* Cabeçalho */}
      <div className={styles.cabecalho}>
        <div className={styles.campo}>
          <span className={styles.campoLabel}>DATA</span>
          <input className={styles.campoInput} value={data} readOnly />
        </div>
        <div className={styles.campo}>
          <span className={styles.campoLabel}>MOTORISTA</span>
          <input className={styles.campoInput} value={vehicle?.motorista_name || ""} readOnly />
        </div>
        <div className={styles.campo}>
          <span className={styles.campoLabel}>ROTA</span>
          <input className={styles.campoInput} value={rota} onChange={e => setRota(e.target.value)} />
        </div>
      </div>

      {/* CELULAR */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>
          CELULAR
          <div className={styles.patrimonioInline}>
            Patrimônio nº <input className={styles.patrimonioInput} value={patCelular} onChange={e => setPatCelular(e.target.value)} placeholder="000" />
          </div>
        </div>
        <ItemRow nome="Nível de Bateria">
          <div className={styles.bateria}>
            {bateriaOpts.map(b => (
              <button key={b} className={`${styles.bateriaOpt} ${bateria === b ? styles.bateriaOptSel : ""}`}
                onClick={() => setBateria(b)}>{b}</button>
            ))}
          </div>
        </ItemRow>
        <ItemRow nome="Capa Protetora"><OpcaoBtn opcoes={okAus} valor={capa} onChange={setCapa} /></ItemRow>
        <ItemRow nome="Película"><OpcaoBtn opcoes={okAus} valor={pelicula} onChange={setPelicula} /></ItemRow>
        <ItemRow nome="Carregador Veicular"><OpcaoBtn opcoes={okAus} valor={carregador} onChange={setCarregador} /></ItemRow>
        <ItemRow nome="Cabo USB-C"><OpcaoBtn opcoes={okAus} valor={cabousb} onChange={setCabousb} /></ItemRow>
      </div>

      {/* IMPRESSORA TÉRMICA */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>
          IMPRESSORA TÉRMICA
          <div className={styles.patrimonioInline}>
            Patrimônio nº <input className={styles.patrimonioInput} value={patImpressora} onChange={e => setPatImpressora(e.target.value)} placeholder="000" />
          </div>
        </div>
        <ItemRow nome="Impressora"><OpcaoBtn opcoes={okAus} valor={impressora} onChange={setImpressora} /></ItemRow>
        <ItemRow nome="Bobina (na máquina)">
          <OpcaoBtn opcoes={[{ val: "cheia", label: "Cheia" }, { val: "metade", label: "Metade", cor: "amber" }, { val: "baixa", label: "Baixa", cor: "red" }]}
            valor={bobinaMaq} onChange={setBobinaMaq} />
        </ItemRow>
        <ItemRow nome="Bobina Extra">
          <OpcaoBtn opcoes={[{ val: "sim", label: "Sim" }, { val: "nao", label: "Não", cor: "red" }]}
            valor={bobinaExtra} onChange={setBobinaExtra} />
        </ItemRow>
      </div>

      {/* MATERIAL DE EXPEDIENTE */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>MATERIAL DE EXPEDIENTE</div>
        <ItemRow nome="Carimbo de Boleto"><OpcaoBtn opcoes={okAus} valor={carimbo} onChange={setCarimbo} /></ItemRow>
        <ItemRow nome="Prancheta"><OpcaoBtn opcoes={okAus} valor={prancheta} onChange={setPrancheta} /></ItemRow>
        <ItemRow nome="Grampeador"><OpcaoBtn opcoes={okAus} valor={grampeador} onChange={setGrampeador} /></ItemRow>
        <ItemRow nome="Régua"><OpcaoBtn opcoes={okAus} valor={regua} onChange={setRegua} /></ItemRow>
        <ItemRow nome="Pasta Plástica Ofício"><OpcaoBtn opcoes={okAus} valor={pasta} onChange={setPasta} /></ItemRow>
        <ItemRow nome="Bolsa Porta-Cédula"><OpcaoBtn opcoes={okAus} valor={bolsa} onChange={setBolsa} /></ItemRow>
        <ItemRow nome="Caneta"><OpcaoBtn opcoes={okAus} valor={caneta} onChange={setCaneta} /></ItemRow>
      </div>

      {/* AVARIAS */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>AVARIAS / OCORRÊNCIAS</div>
        <textarea className={styles.avarias} placeholder="Descreva avarias ou ocorrências..."
          value={avarias} onChange={e => setAvarias(e.target.value)} rows={3} />
      </div>

      {erro && <div className={styles.erro}>{erro}</div>}

      <button className={styles.btnConfirmar} onClick={handleConfirmar} disabled={loading}>
        {loading ? "Registrando..." : "✓ Confirmar saída — Expedição"}
      </button>
    </div>
  )
}
