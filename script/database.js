import { db } from "./firebaseConfig.js"; // Importe o seu db configurado
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Função que será chamada pelo formulário
export async function salvarAgendamento(dadosAgendamento) {
    try {
        // 'agendamentos' é o nome da sua coleção no Firebase
        const docRef = await addDoc(collection(db, "agendamentos"), {
            ...dadosAgendamento,
            dataCriacao: serverTimestamp() // Adiciona a data/hora do servidor
        });
        
        console.log("Documento gravado com ID: ", docRef.id);
        return { sucesso: true, id: docRef.id };
    } catch (error) {
        console.error("Erro ao gravar no banco:", error);
        return { sucesso: false, erro: error };
    }
}

export async function buscarAgendamentosPorBarbeiro(uidBarbeiro) {
  try {
    const q = query(
      collection(db, "agendamentos"), 
      where("barberId", "==", uidBarbeiro), // Filtra pelo ID, não pelo nome
      orderBy("dataCriacao", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    throw error; // Lança o erro para vermos no console
  }
}