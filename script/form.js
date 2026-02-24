import { db } from "./firebaseconfig.js"; // Importe o seu db configurado
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { obterUserId } from "./auth.js";
import { salvarAgendamento } from "./database.js";

const form = document.querySelector('form');
const inputNome = form['client-name'];
const inputTelefone = form['client-number'];
const barbeirosIds = {
    "joao": "NukVxbceU1R572BilTaBDM2P1n33",
    "carlos": "nz5deaqd9zQ64HdSwvIbidPyTT13",
    "marcos": "4s5vZbkw5uWhLTMXRQAjH5SEc0p2"
};

const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const hojeNome = diasSemana[new Date().getDay()];

function validarNome(nome) {
    const regexNome = /^[a-zA-ZÀ-ÿ\s]{3,}$/;
    return regexNome.test(nome.trim());
}

inputNome.addEventListener('blur', (e) => {
  const nomeValido = validarNome(inputNome.value);
    
  if (!nomeValido) {
    alert("Por favor, digite um nome válido (mínimo 4 letras, sem números ou caracteres especiais).");
    inputNome.style.borderColor = 'red';
    return;
  } else {
    inputNome.style.borderColor = '';
  }
})

inputTelefone.addEventListener('input', (e) => {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);

    // A lógica aqui é: (DDD) 9XXXX-XXXX
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
})

function blockday () {
  const data = new Date().getDay();
  const inputs = document.querySelectorAll('input[type="radio"]');
  
  for (let i = 0; i < inputs.length; i++) {
    const diaDoBotao = parseInt(inputs[i].getAttribute("data-day"));
    const label = document.querySelector(`label[for="${inputs[i].id}"]`);

    if (diaDoBotao < data) {
        inputs[i].disabled = true;
        if (label) {
            label.classList.add("btn-locked");
        }
    }
  }
} blockday();

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const dadosCliente = Object.fromEntries(formData.entries());

  // 1. O value do select agora já traz o UID (ex: "NukVxb...")
  const idDoBarbeiro = dadosCliente.barber;

  // 2. Opcional: Para manter o nome legível no banco (ex: "joao")
  // Procuramos no seu objeto 'barbeirosIds' qual nome corresponde a esse ID
  const nomeBarbeiro = Object.keys(barbeirosIds).find(nome => barbeirosIds[nome] === idDoBarbeiro);

  const agendamento = {
      ...dadosCliente,
      barber: nomeBarbeiro || "desconhecido", // Salva o nome (joao, carlos...)
      barberId: idDoBarbeiro,                // Salva o ID real para as queries
      status: "pendente",
      dataCriacao: new Date().toISOString()
  };

  const resultado = await salvarAgendamento(agendamento);

  if (resultado.sucesso) {
      alert("Agendamento enviado!");
      event.target.reset();
      
      // 3. Importante: Chama a função para bloquear o horário que acabou de ser ocupado
      atualizarHorarios(); 
  } else {
      alert("Erro ao enviar agendamento. Tente novamente.");
  }
});

const botoesDia = document.querySelectorAll('input[name="dia_agendamento"]');

botoesDia.forEach(radio => {
  radio.addEventListener('change', (e) => {
    if (e.target.checked) {
      const diaSelecionado = e.target.value;
      const numeroDia = e.target.dataset.day;
      atualizarHorarios();
    }
  });
});

document.querySelector('#barber').addEventListener('change', atualizarHorarios);

async function atualizarHorarios() {
    const selectHorarios = document.querySelector('#hour');
    const selectBarbeiro = document.querySelector('#barber');
    const radioDiaAtivo = document.querySelector('input[name="dia_agendamento"]:checked');

    if (!selectHorarios || !selectBarbeiro || !radioDiaAtivo) return;

    // 1. Reset de Interface: Limpa estados anteriores antes da nova busca
    selectHorarios.value = "";
    const opcoes = Array.from(selectHorarios.options);
    
    opcoes.forEach(option => {
        if (option.value === "") return;
        option.disabled = false;
        option.style.color = '';
        // Remove avisos de (Ocupado) ou (Indisponível) do texto original
        option.textContent = option.value; 
    });

    const barbeiroId = selectBarbeiro.value;
    console.log(barbeiroId)
    const diaSelecionado = radioDiaAtivo.value.trim().toLowerCase();

    // 2. Preparação do Tempo Atual
    const agora = new Date();
    const formatador = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
    const hojeNome = formatador.format(agora).toLowerCase().trim();
    const horaAtual = agora.getHours();
    const minutoAtual = agora.getMinutes();

    const horariosOcupados = [];

    try {
        // 3. Busca no Firebase (Certifique-se que dia_agendamento no DB seja igual ao value do radio)
        const q = query(
            collection(db, "agendamentos"),
            where("barberId", "==", barbeiroId),
            where("dia_agendamento", "==", diaSelecionado)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const dado = doc.data().hour;
            if (dado) horariosOcupados.push(dado.trim());
        });
        console.log("Dia pesquisado:", diaSelecionado);
        console.log("Horários encontrados no banco:", horariosOcupados);

        // 4. Lógica de Bloqueio Unificada
        opcoes.forEach(option => {
            if (option.value === "") return;

            const horarioTexto = option.value.trim();
            const [hora, minuto] = horarioTexto.split(':').map(Number);

            // Verificação A: Ocupado no Banco
            const ocupadoNoBanco = horariosOcupados.includes(horarioTexto);

            // Verificação B: Passado no Relógio (Apenas se for HOJE)
            let jaPassouNoRelogio = false;
            if (diaSelecionado === hojeNome) {
                if (hora < horaAtual || (hora === horaAtual && minuto <= minutoAtual)) {
                    jaPassouNoRelogio = true;
                }
            }

            // Aplicação Final
            if (ocupadoNoBanco || jaPassouNoRelogio) {
                option.disabled = true;
                option.style.color = '#999'; 
                
                if (ocupadoNoBanco) {
                    option.textContent = `${horarioTexto} (Ocupado)`;
                } else if (jaPassouNoRelogio) {
                    option.textContent = `${horarioTexto} (Encerrado)`;
                }
            }
        });

    } catch (error) {
        console.error("Erro na atualização de horários:", error);
    }
}