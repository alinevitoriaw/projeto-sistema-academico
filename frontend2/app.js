document.addEventListener('DOMContentLoaded', () => {
    const containers = {
        selection: document.getElementById('selection-container'),
        loginAluno: document.getElementById('login-aluno-container'),
        loginProfessor: document.getElementById('login-professor-container'),
        app: document.getElementById('app')
    };
    const pageContent = document.getElementById('page-content');
    const API_BASE_URL = 'http://localhost:8000/api';

    async function apiFetch(endpoint, options = {} ) {
        const config = { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } };
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.erro || 'Erro na API');
            }
            return response.status === 204 ? null : response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }
    const api = {
        get: (endpoint) => apiFetch(endpoint),
        post: (endpoint, data) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    };

    function iniciarSessao(role, userData) {
        Object.values(containers).forEach(c => c.style.display = 'none');
        containers.app.style.display = 'flex';
        
        document.getElementById('user-name-perfil').textContent = userData.nome;
        document.getElementById('user-email-perfil').textContent = userData.email;
        document.getElementById('welcome-message').textContent = `Bem-vindo(a), ${userData.nome.split(' ')[0]}!`;

        if (role === 'aluno') {
            montarMenuAluno();
            document.getElementById('welcome-submessage').textContent = 'Seu portal acadêmico pessoal.';
        } else if (role === 'professor') {
            montarMenuProfessor();
            document.getElementById('welcome-submessage').textContent = 'Seu portal de gestão de turmas.';
        }
        
        carregarPagina('inicio');
    }

    function addMenuListeners() {
        const navLinks = document.querySelectorAll('#main-nav ul li');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                navLinks.forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');
                carregarPagina(page);
            });
        });
    }

    function montarMenuAluno() {
        document.getElementById('main-nav').innerHTML = `
            <ul>
                <li data-page="inicio" class="active">Início</li>
                <li data-page="meu-perfil-aluno">Meu Perfil</li>
                <li data-page="minhas-turmas">Minhas Turmas</li>
                <li data-page="inscrever">Inscrever-se</li>
            </ul>`;
        addMenuListeners();
    }

    function montarMenuProfessor() {
        document.getElementById('main-nav').innerHTML = `
            <ul>
                <li data-page="inicio" class="active">Início</li>
                <li data-page="meu-perfil-prof">Meu Perfil</li>
                <li data-page="minhas-turmas-prof">Minhas Turmas</li>
            </ul>`;
        addMenuListeners();
    }

    function carregarPagina(page) {
        switch (page) {
            case 'inicio': carregarInicio(); break;
            case 'meu-perfil-aluno': carregarMeuPerfilAluno(); break;
            case 'minhas-turmas': carregarMinhasTurmas(); break;
            case 'inscrever': carregarInscricao(); break;
            case 'meu-perfil-prof': carregarMeuPerfilProfessor(); break;
            case 'minhas-turmas-prof': carregarMinhasTurmasProfessor(); break;
            default: pageContent.innerHTML = `<div class="card"><h2>Página não encontrada</h2></div>`;
        }
    }

    function carregarInicio() {
        pageContent.innerHTML = `<div class="card"><h2>Página Inicial</h2><p>Bem-vindo(a) ao portal. Use o menu para navegar.</p></div>`;
    }

    function carregarMeuPerfilAluno() {
        const aluno = JSON.parse(localStorage.getItem('userData'));
        pageContent.innerHTML = `<div class="card"><h2>Meu Perfil de Aluno</h2><p><strong>Nome:</strong> ${aluno.nome}</p><p><strong>Matrícula:</strong> ${aluno.matricula}</p><p><strong>CPF:</strong> ${aluno.cpf}</p><p><strong>Email:</strong> ${aluno.email}</p></div>`;
    }

    function carregarMeuPerfilProfessor() {
        const professor = JSON.parse(localStorage.getItem('userData'));
        pageContent.innerHTML = `<div class="card"><h2>Meu Perfil de Professor</h2><p><strong>Nome:</strong> ${professor.nome}</p><p><strong>ID SIAPE:</strong> ${professor.id_SIAPE}</p><p><strong>CPF:</strong> ${professor.cpf}</p><p><strong>Email:</strong> ${professor.email}</p></div>`;
    }

    async function carregarMinhasTurmas() {
        const aluno = JSON.parse(localStorage.getItem('userData'));
        pageContent.innerHTML = `<div class="card"><h2>Carregando...</h2></div>`;
        try {
            const turmas = await api.get(`matriculas.php?matricula=${aluno.matricula}`);
            let html = `<div class="card"><h2>Minhas Turmas</h2><table class="table"><thead><tr><th>Disciplina</th><th>Professor</th><th>Status</th></tr></thead><tbody>`;
            if (turmas && turmas.length > 0) {
                turmas.forEach(t => { html += `<tr><td>${t.nome_disciplina}</td><td>${t.nome_professor}</td><td>${t.status}</td></tr>`; });
            } else {
                html += `<tr><td colspan="3">Você não está matriculado em turmas.</td></tr>`;
            }
            pageContent.innerHTML = html + `</tbody></table></div>`;
        } catch (e) { pageContent.innerHTML = `<div class="card"><p>Não foi possível carregar suas turmas.</p></div>`; }
    }

    async function carregarInscricao() {
        pageContent.innerHTML = `<div class="card"><h2>Carregando...</h2></div>`;
        try {
            const turmas = await api.get('turmas.php');
            let html = `<div class="card"><h2>Inscrever-se em Turmas</h2><table class="table"><thead><tr><th>Disciplina</th><th>Professor</th><th>Ação</th></tr></thead><tbody>`;
            if (turmas && turmas.length > 0) {
                turmas.forEach(t => { html += `<tr><td>${t.nome_disciplina}</td><td>${t.nome_professor}</td><td><button class="btn" onclick="inscreverEmTurma(${t.id_turma})">Inscrever</button></td></tr>`; });
            } else {
                html += `<tr><td colspan="3">Nenhuma turma disponível.</td></tr>`;
            }
            pageContent.innerHTML = html + `</tbody></table></div>`;
        } catch (e) { pageContent.innerHTML = `<div class="card"><p>Não foi possível carregar as turmas.</p></div>`; }
    }

    window.inscreverEmTurma = async (idTurma) => {
        const aluno = JSON.parse(localStorage.getItem('userData'));
        if (confirm('Confirmar inscrição nesta turma?')) {
            try {
                await api.post('matriculas.php', { matricula: aluno.matricula, id_turma: idTurma });
                alert('Inscrição realizada!');
                carregarPagina('minhas-turmas');
            } catch (e) { alert('Erro ao inscrever.'); }
        }
    };

    async function carregarMinhasTurmasProfessor() {
        const professor = JSON.parse(localStorage.getItem('userData'));
        pageContent.innerHTML = `<div class="card"><h2>Carregando...</h2></div>`;
        try {
            const turmas = await api.get(`turmas.php?id_siape=${professor.id_SIAPE}`);
            let html = `<div class="card"><h2>Minhas Turmas</h2><table class="table"><thead><tr><th>Turma</th><th>Disciplina</th><th>Ação</th></tr></thead><tbody>`;
            if (turmas && turmas.length > 0) {
                turmas.forEach(t => { html += `<tr><td>${t.nome_turma}</td><td>${t.nome_disciplina}</td><td><button class="btn" onclick="lancarNotas(${t.id_turma}, '${t.nome_turma}')">Lançar Notas</button></td></tr>`; });
            } else {
                html += `<tr><td colspan="3">Nenhuma turma atribuída a você.</td></tr>`;
            }
            pageContent.innerHTML = html + `</tbody></table></div>`;
        } catch (e) { pageContent.innerHTML = `<div class="card"><p>Não foi possível carregar suas turmas.</p></div>`; }
    }

    window.lancarNotas = async (idTurma, nomeTurma) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
        
        overlay.innerHTML = `<div class="modal-content"><h2>Carregando alunos...</h2></div>`;
        
        try {
            const alunos = await api.get(`matriculas.php?id_turma=${idTurma}`);
            let html = `<h2>Lançar Notas - ${nomeTurma}</h2><table class="table"><thead><tr><th>Aluno</th><th>Matrícula</th><th>Status</th></tr></thead><tbody>`;
            if (alunos && alunos.length > 0) {
                alunos.forEach(a => { html += `<tr><td>${a.nome}</td><td>${a.matricula}</td><td>${a.status}</td></tr>`; });
            } else {
                html += `<tr><td colspan="3">Nenhum aluno nesta turma.</td></tr>`;
            }
            html += `</tbody></table>  
<button class="btn" onclick="document.body.removeChild(this.closest('.modal-overlay'))">Fechar</button>`;
            overlay.querySelector('.modal-content').innerHTML = html;
        } catch (e) { overlay.querySelector('.modal-content').innerHTML = `<p>Erro ao carregar alunos.</p>  
<button onclick="document.body.removeChild(this.closest('.modal-overlay'))">Fechar</button>`; }
    };

    // para testarrrr
    const alunoDeTeste = { nome: "Vitória Teste", email: "vitoria.teste@email.com", matricula: "2025001", cpf: "111.222.333-44" };
    const professorDeTeste = { nome: "Dr. Ricardo Professor", email: "ricardo.prof@email.com", id_SIAPE: "987654", cpf: "444.555.666-77" };

    const roleParaTestar = 'professor'; // Mude para 'aluno' para testar o outro painel
    
    localStorage.setItem('userData', JSON.stringify(roleParaTestar === 'aluno' ? alunoDeTeste : professorDeTeste));
    iniciarSessao(roleParaTestar, JSON.parse(localStorage.getItem('userData')));
});