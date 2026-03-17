// Elementos DOM
const btnHome = document.getElementById('btn-home');
const btnCadastro = document.getElementById('btn-cadastro');
const btnQuiz = document.getElementById('btn-quiz');

const pageHome = document.getElementById('home');
const pageCadastro = document.getElementById('cadastro');
const pageQuiz = document.getElementById('quiz');

const form = document.getElementById('question-form');
const quizContainer = document.getElementById('quiz-container');
const btnNext = document.getElementById('btn-next');
const btnMarcarFav = document.getElementById('btn-marcar-fav');
const btnMarcarRev = document.getElementById('btn-marcar-rev');

const exportBtn = document.getElementById('export-btn');
const shareBtn = document.getElementById('share-btn');
const shareLink = document.getElementById('share-link');

let questions = [];
let currentQuizIndex = 0;

function switchPage(target) {
  [pageHome, pageCadastro, pageQuiz].forEach(p => p.classList.remove('active'));
  [btnHome, btnCadastro, btnQuiz].forEach(b => b.classList.remove('active'));

  if (target === 'home') {
    pageHome.classList.add('active');
    btnHome.classList.add('active');
  } else if (target === 'cadastro') {
    pageCadastro.classList.add('active');
    btnCadastro.classList.add('active');
  } else if (target === 'quiz') {
    if (questions.length === 0) {
      quizContainer.innerHTML = '<p>Nenhuma questão cadastrada ainda.</p>';
      btnNext.style.display = 'none';
      btnMarcarFav.style.display = 'none';
      btnMarcarRev.style.display = 'none';
    } else {
      currentQuizIndex = 0;
      showQuizQuestion();
      btnNext.style.display = 'inline-block';
      btnMarcarFav.style.display = 'inline-block';
      btnMarcarRev.style.display = 'inline-block';
    }
    pageQuiz.classList.add('active');
    btnQuiz.classList.add('active');
  }
}

// Eventos de navegação
btnHome.addEventListener('click', () => switchPage('home'));
btnCadastro.addEventListener('click', () => switchPage('cadastro'));
btnQuiz.addEventListener('click', () => switchPage('quiz'));

// Load questions from localStorage
function loadQuestions() {
  const data = localStorage.getItem('minhasQuestoes');
  if (data) {
    questions = JSON.parse(data);
  } else {
    questions = [];
  }
}

// Save questions to localStorage
function saveQuestions() {
  localStorage.setItem('minhasQuestoes', JSON.stringify(questions));
}

// Limpar o formulário após submit
function clearForm() {
  form.reset();
}

// Salvar nova questão
form.addEventListener('submit', e => {
  e.preventDefault();

  const disciplina = document.getElementById('disciplina').value.trim();
  const tema = document.getElementById('tema').value.trim();
  const enunciado = document.getElementById('enunciado').value.trim();
  const resposta = document.getElementById('resposta').value.toUpperCase().trim();

  const opcoesEls = Array.from(form.querySelectorAll('.opcao'));
  const opcoes = opcoesEls.map(i => i.value.trim()).filter(v => v.length > 0);

  if (opcoes.length < 2) {
    alert('Informe pelo menos 2 opções.');
    return;
  }

  const opcoesValidLetters = ['A','B','C','D','E'];
  if (!opcoesValidLetters.includes(resposta) || opcoes[resposta.charCodeAt(0) - 65] === undefined) {
    alert('Resposta correta inválida para as opções inseridas.');
    return;
  }

  const questao = {
    id: Date.now(),
    disciplina,
    tema,
    enunciado,
    opcoes,
    resposta,
    revisada: false,
    favorita: false
  };

  questions.push(questao);
  saveQuestions();
  clearForm();
  alert('Questão salva com sucesso!');
});

// Mostrar a questão atual no quiz
function showQuizQuestion() {
  if (questions.length === 0) return;

  const q = questions[currentQuizIndex];
  let html = `
    <strong>Disciplina:</strong> ${q.disciplina} | <strong>Tema:</strong> ${q.tema} <br/>
    <p><strong>Q${currentQuizIndex + 1}:</strong> ${q.enunciado}</p>
    <form id="quiz-form">
  `;

  const letters = ['A', 'B', 'C', 'D', 'E'];
  q.opcoes.forEach((opt, i) => {
    html += `
      <label class="option-label">
        <input type="radio" name="resposta" value="${letters[i]}" required />
        (${letters[i]}) ${opt}
      </label>
    `;
  });

  html += `
    </form>
    <p id="feedback" style="font-weight:bold; margin-top:0.5rem;"></p>
    <p>Status: ${q.revisada ? '✅ Revisada' : '❌ Não revisada'} | ${q.favorita ? '⭐ Favorita' : 'Sem estrela'}</p>
  `;

  quizContainer.innerHTML = html;

  // Limpar feedback e ativar botões
  const feedbackEl = document.getElementById('feedback');
  const quizForm = document.getElementById('quiz-form');

  quizForm.addEventListener('change', e => {
    const valor = e.target.value;
    if (valor === q.resposta) {
      feedbackEl.textContent = 'Resposta correta! 🎉';
      feedbackEl.style.color = 'green';
    } else {
      feedbackEl.textContent = `Resposta incorreta. A correta é (${q.resposta}).`;
      feedbackEl.style.color = 'red';
    }
  });

  btnMarcarFav.textContent = q.favorita ? 'Desmarcar Favorita' : 'Marcar Favorita';
  btnMarcarRev.textContent = q.revisada ? 'Desmarcar Revisada' : 'Marcar Revisada';
}

// Botão Próxima questão
btnNext.addEventListener('click', () => {
  currentQuizIndex++;
  if (currentQuizIndex >= questions.length) currentQuizIndex = 0;
  showQuizQuestion();
});

// Marcar e desmarcar favorita
btnMarcarFav.addEventListener('click', () => {
  const q = questions[currentQuizIndex];
  q.favorita = !q.favorita;
  saveQuestions();
  showQuizQuestion();
});

// Marcar e desmarcar revisada
btnMarcarRev.addEventListener('click', () => {
  const q = questions[currentQuizIndex];
  q.revisada = !q.revisada;
  saveQuestions();
  showQuizQuestion();
});

// Exportar questões em JSON para download
exportBtn.addEventListener('click', () => {
  if (questions.length === 0) {
    alert('Nenhuma questão para exportar.');
    return;
  }
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "meu_banco_de_questoes.json");
  document.body.appendChild(dlAnchorElem);
  dlAnchorElem.click();
  dlAnchorElem.remove();
});

// Gerar link para compartilhar (base64 encode JSON)
shareBtn.addEventListener('click', () => {
  if (questions.length === 0) {
    alert('Nenhuma questão para compartilhar.');
    return;
  }
  const jsonStr = JSON.stringify(questions);
  const b64 = btoa(jsonStr); 
  const url = `${location.origin}${location.pathname}#${b64}`;
  shareLink.textContent = url;
  navigator.clipboard.writeText(url);
  alert('Link copiado para a área de transferência!');
});

// Carregar questões do hash se existir (importar do link compartilhado)
function importFromHash() {
  if (location.hash.length > 1) {
    try {
      const hashData = location.hash.substring(1);
      const jsonStr = atob(hashData);
      const importedQuestions = JSON.parse(jsonStr);
      if (Array.isArray(importedQuestions)) {
        questions = importedQuestions;
        saveQuestions();
        alert('Questões importadas do link com sucesso!');
      }
      location.hash = '';
    } catch {
      // hash inválido, ignore
    }
  }
}

// Inicialização
loadQuestions();
importFromHash();
switchPage('home');
