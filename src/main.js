import "./style.css"

/* ================= 1. STATO ================= */
const CHIAVE = "todo-tasks"
const CHIAVE_NOME = "todo-nome"   //es7

// es5
function caricaStato() {
  const testo = localStorage.getItem(CHIAVE)
  if (testo === null) return []

  try {
    const dati = JSON.parse(testo)
    // json array
    return Array.isArray(dati) ? dati : []
  } catch (errore) {
    console.error("Dati salvati non validi, riparto da zero:", errore.message)
    return []
  }
}

let tasks = caricaStato()

/* ================= 2. RIFERIMENTI ================= */
const lista     = document.querySelector("#lista")
const info      = document.querySelector("#info")
const form      = document.querySelector("#form-task")
const campo     = document.querySelector("#campo-task")
const benvenuto = document.querySelector("#benvenuto")   // es7
const azioni    = document.querySelector("#azioni")      // es9
const messaggio = document.querySelector("#messaggio")   // es8

/* ================= 3. PERSISTENZA ================= */
function salvaStato() {
  localStorage.setItem(CHIAVE, JSON.stringify(tasks))
}

/* ================= 4. VIEW ================= */
function render() {
  // aggiunta, i completati vanno in fondo
  const ordinati = [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed))

  lista.innerHTML = ordinati
    .map(t => `
      <li class="${t.completed ? "fatto" : ""}" data-id="${t.id}">
        <span class="titolo">${t.title}</span>
        <button class="elimina" data-id="${t.id}">×</button>
      </li>
    `)
    .join("")

  // es2
  const totali    = tasks.length
  const completati = tasks.filter(t => t.completed).length
  const daFare    = totali - completati
  info.textContent = `Totali: ${totali} · Completati: ${completati} · Da fare: ${daFare}`

  // es8
  if (totali === 0) {
    messaggio.textContent = "Non hai task. Buona giornata."
  } else if (daFare === 0) {
    messaggio.textContent = "Fatto tutto. Complimenti."
  } else {
    messaggio.textContent = `Ti restano ${daFare} task su ${totali}.`
  }

  // es9
  azioni.innerHTML = completati > 0
    ? `<button id="pulisci">Elimina completati (${completati})</button>`
    : ""
}

// es7
function renderBenvenuto() {
  const nome = localStorage.getItem(CHIAVE_NOME)

  if (nome) {
    benvenuto.innerHTML = `<p>Bentornato, ${nome}</p>`
    return
  }

  benvenuto.innerHTML = `
    <input type="text" id="campo-nome" placeholder="Come ti chiami?" autocomplete="off">
    <button id="salva-nome">Salva</button>
  `

  document.querySelector("#salva-nome").addEventListener("click", () => {
    const valore = document.querySelector("#campo-nome").value.trim()
    if (valore === "") return
    localStorage.setItem(CHIAVE_NOME, valore)
    renderBenvenuto()
  })
}

/* ================= 5. AZIONI ================= */

// es4
function aggiornaStato(nuoviTasks) {
  tasks = nuoviTasks
  salvaStato()
  render()
}

function addTask(title) {
  const pulito = title.trim()
  if (pulito === "") return

  aggiornaStato([...tasks, { id: Date.now(), title: pulito, completed: false }])
}

function toggleTask(id) {
  aggiornaStato(
    tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
  )
}

function deleteTask(id) {
  aggiornaStato(tasks.filter(t => t.id !== id))
}

// es9
function deleteCompletati() {
  if (!confirm("Elimino tutti i task completati?")) return
  aggiornaStato(tasks.filter(t => !t.completed))
}

/* ================= 6. EVENTI ================= */
form.addEventListener("submit", (evento) => {
  evento.preventDefault()
  addTask(campo.value)
  campo.value = ""
  campo.focus()
})

lista.addEventListener("click", (evento) => {
  const elemento = evento.target

  if (elemento.classList.contains("elimina")) {
    deleteTask(Number(elemento.dataset.id))
    return
  }

  const riga = elemento.closest("li")
  if (riga) {
    toggleTask(Number(riga.dataset.id))
  }
})

// es9
azioni.addEventListener("click", (evento) => {
  if (evento.target.id === "pulisci") {
    deleteCompletati()
  }
})

/* ================= 7. AVVIO ================= */
renderBenvenuto()
render()