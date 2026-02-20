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
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const agendamentos = Object.fromEntries(data.entries());
    console.log("Dados do Agendamento:", agendamentos);
});

blockday();