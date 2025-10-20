// ============================================================
// Organização Solidária - main.js
// Atividade 3: JavaScript avançado (DOM, validação, armazenamento, SPA)
// ============================================================

// ---------- Funções Utilitárias ----------
function apenasNumeros(str) {
  return str.replace(/\D/g, "");
}

function formatCPF(valor) {
  valor = apenasNumeros(valor).slice(0, 11);
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return valor;
}

function formatTelefone(valor) {
  valor = apenasNumeros(valor).slice(0, 11);
  if (valor.length <= 10) {
    valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  } else {
    valor = valor.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  }
  return valor;
}

function formatCEP(valor) {
  valor = apenasNumeros(valor).slice(0, 8);
  valor = valor.replace(/(\d{5})(\d{0,3})/, "$1-$2").replace(/-$/, "");
  return valor;
}

// ---------- Máscaras automáticas ----------
function aplicarMascaras() {
  const cpf = document.getElementById("cpf");
  const tel = document.getElementById("telefone");
  const cep = document.getElementById("cep");

  if (cpf) cpf.addEventListener("input", (e) => e.target.value = formatCPF(e.target.value));
  if (tel) tel.addEventListener("input", (e) => e.target.value = formatTelefone(e.target.value));
  if (cep) cep.addEventListener("input", (e) => e.target.value = formatCEP(e.target.value));
}

// ---------- Validações ----------
function validarCPF(cpf) {
  cpf = apenasNumeros(cpf);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === parseInt(cpf[10]);
}

function validarCampos(dados) {
  const erros = [];
  if (!dados.nome || dados.nome.length < 3) erros.push("Nome inválido (mínimo 3 letras)");
  if (!dados.email.includes("@")) erros.push("E-mail inválido");
  if (!validarCPF(dados.cpf)) erros.push("CPF inválido");
  if (!/^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(dados.telefone)) erros.push("Telefone inválido");
  if (!dados.nascimento) erros.push("Informe a data de nascimento");
  if (!/^\d{5}-\d{3}$/.test(dados.cep)) erros.push("CEP inválido");
  return erros;
}

// ---------- Armazenamento Local ----------
function salvarVoluntario(dados) {
  const lista = JSON.parse(localStorage.getItem("voluntarios") || "[]");
  lista.push(dados);
  localStorage.setItem("voluntarios", JSON.stringify(lista));
}

function listarVoluntarios() {
  return JSON.parse(localStorage.getItem("voluntarios") || "[]");
}

// ---------- Exibição dinâmica de voluntários ----------
function renderizarVoluntarios() {
  const lista = listarVoluntarios();
  const container = document.createElement("section");
  container.innerHTML = "<h2>Voluntários Cadastrados</h2>";

  if (lista.length === 0) {
    container.innerHTML += "<p>Nenhum voluntário cadastrado ainda.</p>";
  } else {
    const ul = document.createElement("ul");
    lista.forEach((v) => {
      const li = document.createElement("li");
      li.textContent = `${v.nome} — ${v.email} — ${v.telefone} — ${v.cidade}/${v.estado}`;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  const main = document.querySelector("main");
  if (main) main.appendChild(container);
}

// ---------- SPA básica (navegação sem recarregar) ----------
function inicializarSPA() {
  document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", (e) => {
      const destino = link.getAttribute("href");
      if (destino.endsWith(".html")) {
        e.preventDefault();
        carregarPagina(destino);
      }
    });
  });
}

async function carregarPagina(url) {
  try {
    const resposta = await fetch(url);
    const texto = await resposta.text();
    const novoDoc = new DOMParser().parseFromString(texto, "text/html");
    const novoMain = novoDoc.querySelector("main");
    const main = document.querySelector("main");
    if (novoMain && main) {
      main.innerHTML = novoMain.innerHTML;
      aplicarMascaras();
      configurarFormulario();
    }
    history.pushState({}, "", url);
  } catch (erro) {
    console.error("Erro ao carregar página:", erro);
  }
}

// ---------- Configuração do formulário ----------
function configurarFormulario() {
  const form = document.getElementById("form-cadastro");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const dados = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      cpf: form.cpf.value.trim(),
      telefone: form.telefone.value.trim(),
      nascimento: form.nascimento.value,
      endereco: form.endereco.value.trim(),
      cep: form.cep.value.trim(),
      cidade: form.cidade.value.trim(),
      estado: form.estado.value,
      area: form.area.value,
      turno: Array.from(form.querySelectorAll("input[name='turno']:checked")).map(i => i.value)
    };

    const erros = validarCampos(dados);
    if (erros.length > 0) {
      alert("Corrija os seguintes erros:\n- " + erros.join("\n- "));
      return;
    }

    salvarVoluntario(dados);
    alert("Cadastro realizado com sucesso!");
    form.reset();
    renderizarVoluntarios();
  });
}

// ---------- Inicialização ----------
document.addEventListener("DOMContentLoaded", () => {
  aplicarMascaras();
  configurarFormulario();
  inicializarSPA();

  // Atualiza o ano automaticamente nos rodapés
  const anoSpan = document.getElementById("ano") || document.getElementById("ano2") || document.getElementById("ano3");
  if (anoSpan) anoSpan.textContent = new Date().getFullYear();

  // Renderiza lista de voluntários quando abrir qualquer página
  renderizarVoluntarios();
});
