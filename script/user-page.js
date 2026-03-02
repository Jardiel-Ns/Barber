import { auth } from "./firebaseconfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { buscarAgendamentosPorBarbeiro } from "./database.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log(`Buscando agenda para o UID: ${user.uid}`);
        const agendamentos = await buscarAgendamentosPorBarbeiro(user.uid);
        renderizarAgenda(agendamentos);
    }
});

function switchView(viewName, element) {

  // 1. Esconde todas as seções de visualização
  const views = document.querySelectorAll('.view');
  views.forEach(view => {
    view.style.display = 'none';
  });

  // 2. Remove a classe 'active' de todos os botões
  const buttons = document.querySelectorAll('.nav-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active');
  });

  // 3. Mostra a seção desejada (ID exato do HTML: agenda ou financas)
  const selectedView = document.getElementById(viewName); // <--- CORREÇÃO AQUI
  if (selectedView) {
    selectedView.style.display = 'block';
  } else {
    console.error("View não encontrada:", viewName);
  }

  // 4. Adiciona a classe 'active' ao botão clicado
  if (element) {
    element.classList.add('active');
  }
}

// A função que recebe o array do Firebase
function renderizarAgenda(agendamentosDoFirebase) {
  const container = document.getElementById("container-agenda");
  container.innerHTML = '';
  
  // 1. Organização dos dados (com os nomes reais do seu console)
  const mapaAgendamentos = {};
  
  if (agendamentosDoFirebase && agendamentosDoFirebase.length > 0) {
    agendamentosDoFirebase.forEach(agendamento => {
      // AJUSTE AQUI: mapeando os dados reais
      console.log()
      const dia = agendamento.dia_agendamento; // 'sab.'
      const hora = agendamento.hour;           // '14:00'
      
      if (!mapaAgendamentos[dia]) {
        mapaAgendamentos[dia] = {};
      }
      mapaAgendamentos[dia][hora] = agendamento;
    });
  }

  // 2. Configurações da sua grade
  // ATENÇÃO: Os dias aqui devem bater com o 'sab.' que vem do Firebase
  const diasDaSemana = ["seg.", "ter.", "qua.", "qui.", "sex.", "sab."];
  const mapaDiasTitulos = {
      "seg.": "Segunda",
      "ter.": "Terça",
      "qua.": "Quarta",
      "qui.": "Quinta",
      "sex.": "Sexta",
      "sab.": "Sábado"
  };
  const horaInicio = 8;
  const horaFim = 18;
  
  let htmlCompleto = '';

  // 3. Loop de criação
  diasDaSemana.forEach(diaKey => {
    let colunaHtml = `
      <div class="day-column">
        <h2 class="day-tittle">${mapaDiasTitulos[diaKey]}</h2>
        <div class="agenda-list">
    `;

    for (let h = horaInicio; h <= horaFim; h++) {
      const horaFormatada = h.toString().padStart(2, '0') + ':00';
      
      const agendamentoExistente = mapaAgendamentos[diaKey] ? mapaAgendamentos[diaKey][horaFormatada] : null;

      if (agendamentoExistente) {
        // --- TEMPLATE: HORÁRIO OCUPADO ---
        // AJUSTE AQUI: usando os nomes corretos (cliente, telefone)
        colunaHtml += `
          <div class="agenda-item ocupado">
            <div class="time">
              <span>${horaFormatada}</span>
              <div class="vertical-line"></div>
            </div>
    
            <div class="info">
              <span class="client-name">${agendamentoExistente['client-name'] || 'Cliente'}</span>
              <span class="client-number">${agendamentoExistente['client-number'] || '--'}</span>
            </div>
    
            <div class="toggle">
              <button class="toggle-btn" onclick="toggleMenu(this)">
                <span></span>
              </button>
              <div class="toggle-options">
                <button class="toggle-op">Editar</button>
                <span class="toggle-line"></span>
                <button class="toggle-op">Apagar</button>
                <span class="toggle-line"></span>
                <button class="toggle-op">Ligar</button>
              </div>
            </div>
          </div>
        `;
      } else {
        // --- TEMPLATE: HORÁRIO VAZIO ---
        colunaHtml += `
          <div class="agenda-item vazio">
            <div class="time">
              <span>${horaFormatada}</span>
              <div class="vertical-line"></div>
            </div>
    
            <button class="add-button" onclick="novoAgendamento('${diaKey}', '${horaFormatada}')">
              <img src="../assets/icons/user-round-plus.png" alt="Adicionar">
            </button>
          </div>
        `;
      }
    }

    colunaHtml += `
        </div>
      </div>
    `;
    
    htmlCompleto += colunaHtml;
  });

  container.innerHTML = htmlCompleto;
}

// Opcional: Função de clique para o botão de +
function novoAgendamento(dia, hora) {
  console.log(`Abrir modal de agendamento para ${dia} às ${hora}`);
  // Lógica para abrir seu modal aqui
}

function toggleMenu(btn) {
  // Encontra o menu que está dentro do mesmo 'toggle' que o botão clicado
  const menu = btn.nextElementSibling;
  if (menu) {
    menu.classList.toggle('is-open');
  }
}

window.toggleMenu = function(btn) {
  // O menu 'toggle-options' é o próximo elemento após o botão
  const menu = btn.nextElementSibling;
  
  // Fecha outros menus que possam estar abertos antes de abrir este
  document.querySelectorAll('.toggle-options').forEach(m => {
    if (m !== menu) m.classList.remove('is-open');
  });

  if (menu) {
    menu.classList.toggle('is-open');
  }
};

// Quando a página carregar, força a visualização da agenda
document.addEventListener('DOMContentLoaded', () => {
  const btnAgenda = document.querySelector('.nav-btn[onclick*="agenda"]');
  switchView('agenda', btnAgenda);
});

// Isso torna as funções acessíveis pelo HTML
window.switchView = switchView;
window.renderizarAgenda = renderizarAgenda;
window.novoAgendamento = novoAgendamento;
window.toggleMenu = toggleMenu; // Você já fez algo parecido aqui