const BACKEND_URL = "http://localhost:8080";

class EmailManager {
    constructor() {
        // ---------- Elementos do DOM ----------
        this.form = document.getElementById("emailForm");
        this.messageDiv = document.getElementById("message");
        this.submitBtn = this.form?.querySelector(".cta-button");

        this.cadastroTab = document.getElementById("cadastroTab");
        this.listarTab = document.getElementById("listarTab");
        this.cadastroContent = document.getElementById("cadastroContent");
        this.listarContent = document.getElementById("listarContent");
        this.refreshBtn = document.getElementById("refreshBtn");
        this.emailsList = document.getElementById("emailsList");
        this.replyModal = document.getElementById("replyModal");
        this.replyAssunto = document.getElementById("replyAssunto");
        this.replyCorpo = document.getElementById("replyCorpo");
        this.replyForm = document.getElementById("replyForm");
        this.replyMessage = document.getElementById("replyMessage");
        this.closeReplyModalBtn = document.getElementById("closeReplyModal");
        this.cancelReplyBtn = document.getElementById("cancelReply");
        this.userGreeting = document.getElementById("userGreeting");
        this.emailSearch = document.getElementById("emailSearch");

        this.foldersContainer = document.getElementById('foldersContainer');
        this.foldersToggle = document.getElementById('foldersToggle');

        this.allEmails = [];
        this.currentFilter = 'todos';
        this.searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    }

    init() {
        // Exibir nome do usuário
        const usuarioNome = localStorage.getItem("nomeUsuario");
        if (usuarioNome && this.userGreeting) {
            this.userGreeting.textContent = `Olá, ${usuarioNome}`;
        }

        // Inicializar sistema de pastas
        this.setupFolders();

        // Configurar eventos
        this.setupEventListeners();
        this.setupSearchSystem();

        // Carregar emails
        this.loadEmails();
    }

    // ---------- Sistema de pastas ----------
    setupFolders() {
        if (this.foldersToggle) {
            this.foldersToggle.addEventListener('click', () => {
                this.foldersContainer.classList.toggle('collapsed');
                this.foldersToggle.classList.toggle('active');
            });
        }

        document.querySelectorAll('.folder-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleFolderClick(e.currentTarget));
        });
    }

    handleFolderClick(folderItem) {
        document.querySelectorAll('.folder-item').forEach(item => item.classList.remove('active'));
        folderItem.classList.add('active');

        const status = folderItem.dataset.status;
        const filter = folderItem.dataset.filter;

        if (status) this.currentFilter = status;
        else if (filter) this.currentFilter = filter;

        this.filterEmailsByFolder();
    }

    filterEmailsByFolder() {
        const emails = document.querySelectorAll('.email-item');
        const today = new Date().toDateString();

        emails.forEach(email => {
            let show = false;

            // Filtrar por status ou filtros customizados
            if (this.currentFilter === 'todos') show = true;
            else if (['recebido', 'lido', 'respondido', 'arquivado'].includes(this.currentFilter)) {
                show = email.dataset.status?.toLowerCase() === this.currentFilter;
            } else if (this.currentFilter === 'unread') {
                show = !email.classList.contains('read');
            } else if (this.currentFilter === 'important') {
                show = email.classList.contains('important');
            } else if (this.currentFilter === 'today') {
                const emailDate = new Date(email.dataset.timestamp).toDateString();
                show = emailDate === today;
            }

            email.style.display = show ? 'flex' : 'none';
        });
    }

    updateFolderCounts(emails = []) {
        this.allEmails = emails;

        const counts = { todos: emails.length, recebido: 0, lido: 0, respondido: 0, arquivado: 0, unread: 0, important: 0, today: 0 };
        const today = new Date().toDateString();

        emails.forEach(email => {
            const status = email.status?.toLowerCase();
            const isRead = ['lido', 'respondido', 'arquivado'].includes(status);

            if (counts.hasOwnProperty(status)) counts[status]++;
            if (!isRead) counts.unread++;
            if (email.important) counts.important++;
            if (email.dataRecebida && new Date(email.dataRecebida).toDateString() === today) counts.today++;
        });

        Object.keys(counts).forEach(key => {
            const countElement = document.getElementById(`count${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (countElement) {
                const oldCount = parseInt(countElement.textContent) || 0;
                const newCount = counts[key];
                countElement.textContent = newCount;

                if (newCount > oldCount) {
                    countElement.classList.add('highlight');
                    setTimeout(() => countElement.classList.remove('highlight'), 600);
                }
            }
        });
    }

    // ---------- Eventos principais ----------
    setupEventListeners() {
        if (this.form) this.form.addEventListener("submit", e => this.handleFormSubmit(e));
        if (this.cadastroTab) this.cadastroTab.addEventListener("click", () => this.switchTab("cadastro"));
        if (this.listarTab) this.listarTab.addEventListener("click", () => this.switchTab("listar"));
        if (this.refreshBtn) this.refreshBtn.addEventListener("click", () => this.loadEmails());
        if (this.closeReplyModalBtn) this.closeReplyModalBtn.addEventListener("click", () => this.closeReplyModal());
        if (this.cancelReplyBtn) this.cancelReplyBtn.addEventListener("click", () => this.closeReplyModal());
        if (this.replyForm) this.replyForm.addEventListener("submit", e => this.handleReplySubmit(e));
    }

    // ---------- Sistema de pesquisa ----------
    setupSearchSystem() {
        const searchForm = document.getElementById("searchForm");
        const searchHistoryEl = document.getElementById("searchHistory");

        if (!this.emailSearch || !searchForm) return;

        searchForm.addEventListener("submit", e => {
            e.preventDefault();
            const query = this.emailSearch.value.trim();
            this.handleSearch(query);
        });

        this.emailSearch.addEventListener("input", e => this.filterEmails(e.target.value));
        this.emailSearch.addEventListener("focus", () => this.renderHistory(searchHistoryEl));
        this.emailSearch.addEventListener("blur", () => setTimeout(() => { if (searchHistoryEl) searchHistoryEl.style.display = "none"; }, 200));
    }

    handleSearch(query) {
        if (query && !this.searchHistory.includes(query)) {
            this.searchHistory.push(query);
            localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
        }
        this.filterEmails(query);
        this.renderHistory(document.getElementById("searchHistory"));
    }

    renderHistory(container) {
        if (!container) return;

        container.innerHTML = "";
        if (this.searchHistory.length === 0) { container.style.display = "none"; return; }

        this.searchHistory.slice(-5).reverse().forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            li.onclick = () => {
                this.emailSearch.value = item;
                this.filterEmails(item);
                container.style.display = "none";
            };
            container.appendChild(li);
        });

        container.style.display = "block";
    }

    // ---------- Carregar emails ----------
    async loadEmails() {
        if (!this.refreshBtn || !this.emailsList) return;

        this.refreshBtn.disabled = true;
        this.refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Carregando...</span>';

        this.emailsList.innerHTML = `
            <div class="loading-state">
                <div class="modern-spinner"></div>
                <p>Carregando emails...</p>
            </div>
        `;

        try {
            const userLogin = localStorage.getItem("loginUsuario") || localStorage.getItem("userEmail");
            if (!userLogin) throw new Error("Usuário não identificado. Faça login novamente.");

            const response = await fetch(`${BACKEND_URL}/api/auth/emails/usuario?login=${encodeURIComponent(userLogin)}`, {
                method: "GET",
                headers: { Accept: "application/json" },
            });

            if (response.status === 204) { this.displayEmails([]); return; }
            if (response.ok) {
                const emails = await response.json();
                this.displayEmails(emails);
            } else throw new Error(`Erro ${response.status}: ${await response.text()}`);
        } catch (error) {
            console.error("Erro ao carregar emails:", error);
            this.showErrorInEmailList(error.message);
        } finally {
            this.refreshBtn.disabled = false;
            this.refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i><span>Atualizar</span>';
        }
    }

    // ---------- Exibir emails ----------
    displayEmails(emails) {
        this.allEmails = emails;

        if (!this.emailsList) return;

        if (!emails || emails.length === 0) {
            this.emailsList.innerHTML = `
                <div class="no-emails">
                    <i class="fas fa-inbox"></i>
                    <p>Nenhum email encontrado.</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">Cadastre o primeiro email usando a aba "Novo Email".</p>
                </div>`;
            this.updateFolderCounts([]);
            return;
        }

        const emailsHtml = emails.map(email => {
            const dataFormatada = email.dataRecebida ? new Date(email.dataRecebida).toLocaleString("pt-BR") : "Data não informada";
            const statusOptions = ["RECEBIDO", "LIDO", "RESPONDIDO", "ARQUIVADO"];
            const statusDropdown = statusOptions.map(status => `<option value="${status}" ${status === email.status ? "selected" : ""}>${status}</option>`).join("");

            return `
            <div class="email-item" data-status="${(email.status || '').toLowerCase()}" data-timestamp="${email.dataRecebida}">
                <div class="email-header">
                    <h3 class="email-subject">${this.escapeHtml(email.assunto || "(Sem assunto)")}</h3>
                    <div class="email-actions">
                        <button class="reply-btn" data-id="${email.id}" data-assunto="${this.escapeHtml(email.assunto || "")}" data-remetente="${this.escapeHtml(email.remetente || "")}" data-destinatario="${this.escapeHtml(email.destinatario || "")}" data-corpo="${this.escapeHtml(email.corpo || "")}">
                            <i class="fas fa-reply"></i><span>Responder</span>
                        </button>
                        <div class="email-status-section">
                            <div class="status-update-container">
                                <select class="status-dropdown" data-email-id="${email.id}">${statusDropdown}</select>
                                <i class="fas fa-chevron-down dropdown-icon"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="email-meta">
                    <div class="meta-item"><i class="fas fa-user"></i><span><strong>De:</strong> ${this.escapeHtml(email.remetente || "—")}</span></div>
                    <div class="meta-item"><i class="fas fa-user-check"></i><span><strong>Para:</strong> ${this.escapeHtml(email.destinatario || "—")}</span></div>
                    <div class="meta-item"><i class="fas fa-calendar-alt"></i><span><strong>Data:</strong> ${dataFormatada}</span></div>
                </div>
                <div class="email-body">${this.escapeHtml(email.corpo || "")}</div>
            </div>`;
        }).join("");

        this.emailsList.innerHTML = emailsHtml;

        this.updateFolderCounts(emails);
        this.attachEmailEventListeners();
        this.filterEmailsByFolder(); // abre apenas os emails da pasta selecionada
    }

    attachEmailEventListeners() {
        document.querySelectorAll('.reply-btn').forEach(btn => btn.addEventListener('click', e => this.replyToEmail(e.currentTarget)));
        document.querySelectorAll('.status-dropdown').forEach(dropdown => dropdown.addEventListener('change', e => this.updateEmailStatus(e.target.dataset.emailId, e.target.value)));
    }

    // ---------- Responder email ----------
    replyToEmail(btn) {
        const emailData = {
            id: btn.dataset.id,
            assunto: btn.dataset.assunto,
            remetente: btn.dataset.remetente,
            destinatario: btn.dataset.destinatario,
            corpo: btn.dataset.corpo
        };

        const assunto = emailData.assunto || "(Sem assunto)";
        this.replyAssunto.value = assunto.startsWith("Re: ") ? assunto : `Re: ${assunto}`;
        this.replyForm.dataset.destinatarioOriginal = emailData.remetente || "";
        this.replyForm.dataset.emailOriginalId = emailData.id;

        const dataFormatada = emailData.dataRecebida ? new Date(emailData.dataRecebida).toLocaleString("pt-BR") : "Data não informada";
        this.replyCorpo.value = `\n\n--- Email Original ---\nDe: ${emailData.remetente}\nPara: ${emailData.destinatario}\nAssunto: ${assunto}\nData: ${dataFormatada}\n\n${emailData.corpo}`;

        this.replyModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";

        setTimeout(() => { this.replyCorpo.focus(); this.replyCorpo.setSelectionRange(0, 0); }, 100);
    }

    closeReplyModal() {
        this.replyModal.classList.add("hidden");
        document.body.style.overflow = "auto";
        this.replyForm.reset();
        if (this.replyMessage) this.replyMessage.classList.add("hidden");
    }

    // ---------- Filtros de pesquisa ----------
    filterEmails(query) {
        const searchTerm = query.toLowerCase();
        const filtered = this.allEmails.filter(email =>
            (email.assunto || "").toLowerCase().includes(searchTerm) ||
            (email.remetente || "").toLowerCase().includes(searchTerm) ||
            (email.destinatario || "").toLowerCase().includes(searchTerm)
        );
        this.displayEmails(filtered);
    }

    // ---------- Tabs ----------
    switchTab(tab) {
        if (tab === "cadastro") {
            this.cadastroTab.classList.add("active");
            this.listarTab.classList.remove("active");
            this.cadastroContent.classList.add("active");
            this.listarContent.classList.remove("active");
        } else {
            this.listarTab.classList.add("active");
            this.cadastroTab.classList.remove("active");
            this.listarContent.classList.add("active");
            this.cadastroContent.classList.remove("active");
            this.loadEmails();
        }
    }

    // ---------- Funções utilitárias ----------
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    showErrorInEmailList(message) {
        if (!this.emailsList) return;
        this.emailsList.innerHTML = `
            <div class="no-emails">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar emails: ${this.escapeHtml(message)}</p>
                <button onclick="location.reload()" class="secondary-btn" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i><span>Tentar Novamente</span>
                </button>
            </div>`;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(this.form);
        const userLogin = localStorage.getItem("loginUsuario") || localStorage.getItem("userEmail");

        const emailData = {
            assunto: formData.get("assunto") || "",
            remetente: userLogin,
            destinatario: formData.get("destinatario") || "",
            status: "RECEBIDO",
            corpo: formData.get("corpo") || "",
            dataRecebida: new Date().toISOString()
        };

        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Cadastrando...</span>';
        if (this.messageDiv) this.messageDiv.classList.add("hidden");

        try {
            const response = await fetch(`${BACKEND_URL}/emails`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(emailData)
            });

            if (response.ok) {
                if (this.messageDiv) { this.messageDiv.textContent = "Email cadastrado com sucesso! ✓"; this.messageDiv.className = "message success"; }
                this.form.reset();
                await this.loadEmails();
                this.switchTab("listar");
            } else throw new Error(`Erro ${response.status}: ${await response.text()}`);
        } catch (error) {
            console.error("Erro ao cadastrar email:", error);
            if (this.messageDiv) { this.messageDiv.textContent = error.message; this.messageDiv.className = "message error"; this.messageDiv.classList.remove("hidden"); }
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = '<span class="btn-text">Cadastrar Email</span><i class="fas fa-arrow-right"></i>';
        }
    }

    async handleReplySubmit(e) {
        e.preventDefault();
        const userLogin = localStorage.getItem("loginUsuario") || localStorage.getItem("userEmail");
        const emailOriginalId = this.replyForm.dataset.emailOriginalId;

        const replyData = {
            assunto: this.replyAssunto.value,
            remetente: userLogin,
            destinatario: this.replyForm.dataset.destinatarioOriginal,
            corpo: this.replyCorpo.value,
            status: "RESPONDIDO",
            dataRecebida: new Date().toISOString()
        };

        const submitBtnReply = this.replyForm.querySelector(".cta-button");
        submitBtnReply.disabled = true;
        submitBtnReply.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Enviando...</span>';

        if (this.replyMessage) this.replyMessage.classList.add("hidden");

        try {
            const response = await fetch(`${BACKEND_URL}/emails`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(replyData)
            });

            if (response.ok) {
                if (emailOriginalId) await this.updateEmailStatus(emailOriginalId, "RESPONDIDO");
                if (this.replyMessage) { this.replyMessage.textContent = "Resposta enviada com sucesso! ✓"; this.replyMessage.className = "message success"; this.replyMessage.classList.remove("hidden"); }
                setTimeout(() => { this.closeReplyModal(); this.loadEmails(); }, 1500);
            } else throw new Error(`Erro ${response.status}: ${await response.text()}`);
        } catch (error) {
            if (this.replyMessage) { this.replyMessage.textContent = error.message; this.replyMessage.className = "message error"; this.replyMessage.classList.remove("hidden"); }
        } finally {
            submitBtnReply.disabled = false;
            submitBtnReply.innerHTML = '<span class="btn-text">Enviar Resposta</span><i class="fas fa-paper-plane"></i>';
        }
    }

    async updateEmailStatus(emailId, newStatus) {
        try {
            const dropdown = document.querySelector(`select[data-email-id="${emailId}"]`);
            if (dropdown) { dropdown.disabled = true; dropdown.style.opacity = "0.6"; }

            const response = await fetch(`${BACKEND_URL}/api/auth/emails/${emailId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error(`Erro ${response.status}: ${await response.text()}`);
            await this.loadEmails();
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            await this.loadEmails();
        }
    }
}

// ---------- Inicializar a aplicação ----------
document.addEventListener("DOMContentLoaded", () => {
    const emailApp = new EmailManager();
    emailApp.init();
});
