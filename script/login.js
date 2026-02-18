import { auth } from "./firebaseConfig.js"; 
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const btnEntrar = document.getElementById("btn-entrar");
const emailInput = document.getElementById("email")
const passwordInput = document.getElementById("password")

btnEntrar.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        // Tentativa de login no Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Sucesso:", userCredential.user);
        window.location.href = "../pages/user-page.html"
    } catch (error) {
        // Tratamento de erros comuns
        console.error("Erro completo:", error.code);
        
        if (error.code === 'auth/invalid-credential') {
            alert("E-mail ou senha incorretos.");
        } else {
            alert("Ocorreu um erro ao tentar entrar. Tente novamente.");
        }
    }
});