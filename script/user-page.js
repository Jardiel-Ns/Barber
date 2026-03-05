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
    
            <button class="add-button" onclick="AgendamentoManual('${diaKey}', '${horaFormatada}')">
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

// Variáveis temporárias para guardar o contexto do clique
// 1. Variável global (a "memória" do clique)
let dadosAgendamentoTemporario = {};

// 2. Função chamada pelo botão "+" da agenda
function AgendamentoManual(dia, hora) {
  // Pega o UID ou Nome que você já tem no seu sistema
  // Se você tiver uma variável 'usuarioLogadoUID', use ela aqui
  const barbeiroID = typeof usuarioLogadoUID !== 'undefined' ? usuarioLogadoUID : "Barbeiro_Logado";

  dadosAgendamentoTemporario = {
    dia_agendamento: dia,
    hour: hora,
    barbeiro_id: barbeiroID 
  };

  const popup = document.getElementById("popup-container");
  if (popup) {
    popup.style.display = "flex";
  } else {
    console.error("Erro: Verifique se o ID no HTML é 'popup-container'");
  }
}

// 3. Configuração do formulário (Roda assim que o HTML carregar)
document.addEventListener("DOMContentLoaded", function() {
  const formulario = document.getElementById("popup-form");

  // 1. Achar o botão de fechar
  const btnFechar = document.querySelector(".close-button");
  const popup = document.getElementById("popup-container");

  if (btnFechar && popup) {
        btnFechar.addEventListener("click", function() {
            popup.style.display = "none"; // Esconde o popup
        });
    }

  if (formulario) {
    formulario.addEventListener("submit", function(event) {
      event.preventDefault();

      // Pegando o que o barbeiro digitou no momento
      const nomeCliente = document.getElementById("popup-client-name").value;
      const telefoneCliente = document.getElementById("popup-client-number").value;

      // Montando o objeto final unindo as duas partes
      const agendamentoFinal = {
        ...dadosAgendamentoTemporario,
        "client-name": nomeCliente,
        "client-number": telefoneCliente,
        status: "confirmado",
        criadoEm: new Date().toISOString()
      };

      enviarParaOBanco(agendamentoFinal);
    });
  } else {
    console.error("Erro: O formulário 'popup-form' não foi encontrado.");
  }
});

window.AgendamentoManual = AgendamentoManual;

// 4. Função de envio
async function enviarParaOBanco(dados) {
  console.log("SUCESSO! Objeto pronto:", dados);
  
  // Aqui você vai inserir o código do Firebase depois
  
  // Limpando a tela
  const popup = document.getElementById("popup-container");
  const form = document.getElementById("popup-form");
  
  if (popup) popup.style.display = "none";
  if (form) form.reset();
  
  alert("Agendamento capturado com sucesso no console!");
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