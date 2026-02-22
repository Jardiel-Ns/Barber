const form = document.querySelector('form');

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

import { obterUserId } from "./auth.js";
import { salvarAgendamento } from "./database.js";

const barbeirosIds = {
    "joao": "NukVxbceU1R572BilTaBDM2P1n33",
    "carlos": "nz5deaqd9zQ64HdSwvIbidPyTT13",
    "marcos": "4s5vZbkw5uWhLTMXRQAjH5SEc0p2"
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const dadosCliente = Object.fromEntries(formData.entries());

  // --- O PULO DO GATO ESTÁ AQUI ---
  // Pegamos o nome que veio do <select name="barber"> e buscamos o ID no dicionário
  const idDoBarbeiro = barbeirosIds[dadosCliente.barber];

  const agendamento = {
      ...dadosCliente,
      barberId: idDoBarbeiro, // Agora o Firebase sabe o "RG" do barbeiro
      status: "pendente",
      dataCriacao: new Date().toISOString()
  };

  const resultado = await salvarAgendamento(agendamento);

  if (resultado.sucesso) {
      alert("Agendamento enviado! Aguarde a confirmação.");
      event.target.reset();
  } else {
      alert("Erro ao enviar agendamento. Tente novamente.");
  }
});