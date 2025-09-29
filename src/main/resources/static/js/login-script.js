document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const passwordToggle = document.getElementById("passwordToggle");
  const passwordInput = document.getElementById("password");
  const loginButton = loginForm.querySelector(".login-button");
  const messageContainer = document.getElementById("loginMessage");

  // Toggle de visibilidade da senha
  passwordToggle.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    const icon = passwordToggle.querySelector("i");
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  });

  // Submissão do formulário
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const login = formData.get("email");
    const senha = formData.get("password");

    if (!login || !senha) {
      showMessage("Por favor, preencha todos os campos.", "error");
      return;
    }

    setLoadingState(true);
    hideMessage();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, senha }),
      });

      if (response.ok) {
        const data = await response.json();
        showMessage("Login realizado com sucesso! Redirecionando...", "success");

        // Salva login e nome do usuário no localStorage
        localStorage.setItem("loginUsuario", data.login);
        localStorage.setItem("nomeUsuario", data.nome);

        setTimeout(() => { window.location.href = "/index"; }, 1500);
      } else {
        const errorMessage = await response.text();
        showMessage(errorMessage, "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showMessage("Erro de conexão. Verifique sua internet e tente novamente.", "error");
    } finally {
      setLoadingState(false);
    }
  });

  // Efeitos de foco nos inputs
  const inputs = loginForm.querySelectorAll("input");
  inputs.forEach(input => {
    input.addEventListener("focus", () => input.parentElement.classList.add("focused"));
    input.addEventListener("blur", () => input.parentElement.classList.remove("focused"));
  });

  // Remember me
  const rememberCheckbox = document.getElementById("remember");
  const emailInput = document.getElementById("email");
  const rememberedEmail = localStorage.getItem("rememberedEmail");

  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberCheckbox.checked = true;
  }

  rememberCheckbox.addEventListener("change", function () {
    if (this.checked && emailInput.value) {
      localStorage.setItem("rememberedEmail", emailInput.value);
    } else {
      localStorage.removeItem("rememberedEmail");
    }
  });

  emailInput.addEventListener("input", function () {
    if (rememberCheckbox.checked) {
      localStorage.setItem("rememberedEmail", this.value);
    }
  });

  // Funções auxiliares
  function setLoadingState(loading) {
    loginButton.disabled = loading;
    loginButton.classList.toggle("loading", loading);
  }

  function showMessage(text, type) {
    messageContainer.textContent = text;
    messageContainer.className = `message ${type}`;
    messageContainer.classList.remove("hidden");
    if (type === "success") setTimeout(hideMessage, 3000);
  }

  function hideMessage() {
    messageContainer.classList.add("hidden");
  }
});
