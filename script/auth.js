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
    }
});

export function obterUserId() {
  return currentUser ? currentUser.uid : null;
}