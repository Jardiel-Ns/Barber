import { auth } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { buscarAgendamentosPorBarbeiro } from "./database.js";

const container = document.getElementById("container-agenda");

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Em vez de usar o email, passamos o UID diretamente
        console.log(`Buscando agenda para o UID: ${user.uid}`);
        const agendamentos = await buscarAgendamentosPorBarbeiro(user.uid);
        renderizarAgenda(agendamentos);
    } else {
        window.location.href = "login.html";
    }
});
// Torna a função de finalizar acessível ao clique do botão no HTML
window.finalizarAgendamento = async (id) => {
    if (confirm("Deseja marcar este agendamento como concluído?")) {
        console.log("Finalizando ID:", id);
        // Próximo passo: criar a função de deletar no database.js
    }
};

function renderizarAgenda(lista) {
  if (!container) return;
  container.innerHTML = ""; 

  if (lista.length === 0) {
      container.innerHTML = "<p style='color: white; text-align: center;'>Nenhum agendamento encontrado.</p>";
      return;
  }

  lista.forEach(agendamento => {
    const itemHtml = `
      <div class="agenda-item" id="${agendamento.id}">
        <div class="time">${agendamento.hour || '00:00'}</div>
        <div class="info">
          <span class="client-name">${agendamento['client-name'] || 'Sem nome'}</span>
        </div>
        <button class="done" onclick="finalizarAgendamento('${agendamento.id}')">
          <svg class="icon-default" width="100px" height="100px" viewBox="0 0 24 24" fill="none">
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg class="icon-hover" fill="#2abc29" width="100px" height="100px" viewBox="0 0 24 24">
            <path d="M12,0A12,12,0,1,0,24,12,12,12,0,0,0,12,0ZM11.52,17L6,12.79l1.83-2.37L11.14,13l4.51-5.08,2.24,2Z"/>
          </svg>
        </button>
      </div>
    `;
    container.innerHTML += itemHtml;
  });
}