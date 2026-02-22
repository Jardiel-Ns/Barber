import { auth } from "./firebaseconfig.js"; // O 'auth' já vem pronto daqui!
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const btnEntrar = document.getElementById("btn-entrar");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

let currentUser = null;

// --- LÓGICA DE LOGIN ---
if (btnEntrar) { // Verifica se o botão existe (para não dar erro em outras páginas)
  btnEntrar.addEventListener("click", async (event) => {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Sucesso:", userCredential.user);
      window.location.href = "../pages/user-page.html";
    } catch (error) {
      console.error("Erro:", error.code);
      alert("Erro ao entrar: " + error.code);
    }
  });
}

// --- OBSERVADOR DE ESTADO ---
onAuthStateChanged(auth, (user) => {
    currentUser = user;

    // Obtém o nome da página atual (ex: login.html)
    const currentPage = window.location.pathname.split("/").pop();

    if (user) {
        console.log("Logado:", user.uid);
        // Se o usuário já está logado e está na página de login, 
        // talvez você queira mandá-lo para a dashboard
        if (currentPage === "login.html") {
            window.location.href = "../index.html"; 
        }
    } else {
        // Se NÃO está logado e NÃO está na página de login
        if (currentPage !== "login.html") {
            // No GitHub Pages, o ideal é usar o caminho absoluto do repositório
            // ou garantir que o '../' aponte para o lugar certo
            window.location.href = "pages/login.html"; 
            // Nota: Se você estiver na raiz, o caminho é "pages/login.html"
            // Se estiver em outra subpasta, a lógica muda.
        }
    }
});

export function obterUserId() {
    return currentUser ? currentUser.uid : null;
}