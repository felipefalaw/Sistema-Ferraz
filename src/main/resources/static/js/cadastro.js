document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");
  const messageDiv = document.getElementById("message");
  const submitBtn = form.querySelector(".login-button");

  const API_URL = "http://localhost:8080/cadastro";

  const toggles = document.querySelectorAll(".password-toggle");
  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const input = toggle.previousElementSibling;
      if (input.type === "password") {
        input.type = "text";
        toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
      } else {
        input.type = "password";
        toggle.innerHTML = '<i class="fas fa-eye"></i>';
      }
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const empresa = form.empresa.value.trim();
    const funcao = form.funcao.value.trim();
    const login = form.login.value.trim();
    const senha = form.senha.value;
    const confirmSenha = form.confirmSenha.value;

    messageDiv.className = "message hidden";
    messageDiv.textContent = "";

    if (!nome || !empresa || !funcao || !login || !senha || !confirmSenha) {
      showMessage("Preencha todos os campos.", "error");
      return;
    }

    if (senha !== confirmSenha) {
      showMessage("As senhas não coincidem.", "error");
      return;
    }

    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    const payload = { nome, empresa, funcao, login, senha };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showMessage("Cadastro realizado com sucesso!", "success");
        form.reset();
      } else {
        const data = await response.json();
        showMessage(data?.message || "Erro ao cadastrar usuário.", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Erro ao conectar com o servidor.", "error");
    } finally {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
    }
  });

  function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = `message ${type}`;
  }
});
