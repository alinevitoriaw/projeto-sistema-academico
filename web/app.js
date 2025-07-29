// Utilidades para localStorage
// getData e setData não serão usados para alunos (apenas entidades ainda não integradas ao backend)
function getData(key) {
  if (key === 'alunos') {
    alert('Alunos agora só são lidos do backend!');
    return [];
  }
  return JSON.parse(localStorage.getItem(key) || "[]");
}
function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Modelos iniciais
const MODELS = {
  alunos: { id: '', nome: '', email: '', matricula: '', turma: '' },
  professores: { id: '', nome: '', email: '', disciplinas: [], turmas: [] },
  cursos: { id: '', nome: '', descricao: '' },
  disciplinas: { id: '', nome: '', curso: '' },
  turmas: { id: '', nome: '', curso: '', ano: '' },
  matriculas: { id: '', alunoId: '', disciplinaId: '', turmaId: '' }
};

// Navegação SPA
const pages = {
  inicio: renderInicio,
  alunos: renderAlunos,
  professores: renderProfessores,
  cursos: renderCursos,
  disciplinas: renderDisciplinas,
  turmas: renderTurmas,
  matriculas: renderMatriculas
};

document.querySelectorAll('.sidebar nav ul li').forEach(li => {
  li.onclick = () => {
    document.querySelectorAll('.sidebar nav ul li').forEach(l => l.classList.remove('active'));
    li.classList.add('active');
    showPage(li.dataset.page);
  };
});

function showPage(page) {
  document.getElementById('page-content').innerHTML = '';
  pages[page]();
}
window.onload = () => showPage('inicio');

// ----------- PÁGINAS -----------

function renderInicio() {
  document.getElementById('page-content').innerHTML = `
    <div class="card">
      <h3>Dashboard</h3>
      <div style="display: flex; gap: 30px; flex-wrap: wrap;">
        <div>
          <strong>Alunos:</strong> ${getData('alunos').length}<br>
          <strong>Professores:</strong> ${getData('professores').length}<br>
          <strong>Cursos:</strong> ${getData('cursos').length}<br>
          <strong>Disciplinas:</strong> ${getData('disciplinas').length}<br>
          <strong>Turmas:</strong> ${getData('turmas').length}<br>
        </div>
        <div>
          <strong>Matrículas:</strong> ${getData('matriculas').length}
        </div>
      </div>
    </div>
  `;
}

// ----------- ALUNOS -----------
function renderAlunos() {
  // Busca alunos do backend
  fetch('http://localhost:8000/alunos.php')
    .then(res => res.json())
    .then(alunos => {
      document.getElementById('page-content').innerHTML = `
        <div class="card">
          <h3>Alunos</h3>
          <form id="aluno-form">
  <input type="hidden" name="id">
  <div class="form-group">
    <label>Nome</label>
    <input name="nome" required>
  </div>
  <div class="form-group">
    <label>Email</label>
    <input name="email" type="email" required>
  </div>
  <div class="form-group">
    <label>Matrícula</label>
    <input name="matricula" required>
  </div>
  <div class="form-group">
    <label>CPF</label>
    <input name="cpf" required>
  </div>
  <div class="form-group">
    <label>Data de Nascimento</label>
    <input name="data_nascimento" type="date" required>
  </div>
  <div class="form-group">
    <label>Telefone</label>
    <input name="telefone" required>
  </div>
  <div class="form-group">
    <label>Turma</label>
    <select name="turma">
      <option value="">Selecione</option>
    </select>
  </div>
  <button type="submit">Salvar</button>
  <button type="reset">Limpar</button>
</form>
          <table class="table">
            <thead>
              <tr>
                <th>Nome</th><th>Email</th><th>Matrícula</th><th>Turma</th><th>Ações</th>
              </tr>
            </thead>
            <tbody id="alunos-tbody"></tbody>
          </table>
          <div id="aluno-modal" style="display:none"></div>
        </div>
      `;
      // Renderiza alunos na tabela
      const tbody = document.getElementById('alunos-tbody');
      alunos.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${aluno.nome}</td>
          <td>${aluno.email}</td>
          <td>${aluno.matricula}</td>
          <td>${aluno.turma || ''}</td>
          <td>
            <button onclick=\"editAluno('${aluno.matricula}')\">Editar</button>
            <button onclick=\"deleteAluno('${aluno.matricula}')\">Excluir</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      // Aqui você pode adicionar eventos para o formulário se quiser integrar o cadastro futuramente
      document.getElementById('aluno-form').onsubmit = saveAluno;
    });
}
function saveAluno(e) {
  e.preventDefault();
  const form = e.target;
  const aluno = {
    matricula: form.matricula.value,
    nome: form.nome.value,
    cpf: form.cpf ? form.cpf.value : '',
    data_nascimento: form.data_nascimento ? form.data_nascimento.value : '',
    email: form.email.value,
    telefone: form.telefone ? form.telefone.value : ''
  };
  fetch('http://localhost:8000/alunos.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(aluno)
  })
  .then(async res => {
    let data = {};
    if (res.ok) {
      try { data = await res.json(); }
      catch { data = { mensagem: 'Erro ao interpretar JSON.' }; }
    } else {
      data = { mensagem: 'Erro na requisição: ' + res.status };
    }
    alert(JSON.stringify(data));
    renderAlunos();
  })
  .catch(err => alert('Erro ao cadastrar/atualizar aluno! ' + err));
}
function editAluno(matricula) {
  fetch(`http://localhost:8000/alunos.php`)
    .then(res => res.json())
    .then(alunos => {
      const aluno = alunos.find(a => String(a.matricula) === String(matricula));
      if (!aluno) return alert('Aluno não encontrado!');
      const form = document.getElementById('aluno-form');
      form.matricula.value = aluno.matricula;
      form.nome.value = aluno.nome;
      form.cpf.value = aluno.cpf;
      form.data_nascimento.value = aluno.data_nascimento;
      form.email.value = aluno.email;
      form.telefone.value = aluno.telefone;
      // Se tiver campo turma, preencha também
      if (form.turma) form.turma.value = aluno.turma || '';
      // NÃO CHAME saveAluno() AQUI!
    });
}
function deleteAluno(matricula) {
  if (confirm('Excluir este aluno?')) {
    fetch(`http://localhost:8000/alunos.php`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricula })
    })
    .then(res => {
      if (res.ok) {
        alert('Aluno excluído com sucesso!');
        renderAlunos();
      } else {
        alert('Erro ao excluir aluno!');
      }
    })
    .catch(err => alert('Erro ao excluir aluno! ' + err));
  }
}
function viewAluno(id) {
  const aluno = getData('alunos').find(a => a.id === id);
  const turma = getData('turmas').find(t => t.id === aluno.turma);
  document.getElementById('aluno-modal').style.display = 'block';
  document.getElementById('aluno-modal').innerHTML = `
    <div class="card" style="position:fixed;top:20%;left:40%;z-index:10;min-width:300px;">
      <h3>Informações do Aluno</h3>
      <p><b>Nome:</b> ${aluno.nome}</p>
      <p><b>Email:</b> ${aluno.email}</p>
      <p><b>Matrícula:</b> ${aluno.matricula}</p>
      <p><b>Turma:</b> ${turma?.nome||''}</p>
      <button onclick="closeAlunoModal()">Fechar</button>
    </div>
  `;
}
function closeAlunoModal() {
  document.getElementById('aluno-modal').style.display = 'none';
}

// ----------- PROFESSORES -----------
function renderProfessores() {
  const professores = getData('professores');
  document.getElementById('page-content').innerHTML = `
    <div class="card">
      <h3>Professores</h3>
      <form id="prof-form">
        <input type="hidden" name="id">
        <div class="form-group">
          <label>Nome</label>
          <input name="nome" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input name="email" type="email" required>
        </div>
        <div class="form-group">
          <label>Disciplinas</label>
          <select name="disciplinas" multiple>
            ${getData('disciplinas').map(d => `<option value="${d.id}">${d.nome}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Turmas</label>
          <select name="turmas" multiple>
            ${getData('turmas').map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
          </select>
        </div>
        <button type="submit">Salvar</button>
        <button type="reset">Limpar</button>
      </form>
      <table class="table">
        <thead>
          <tr>
            <th>Nome</th><th>Email</th><th>Disciplinas</th><th>Turmas</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${professores.map(p => `
            <tr>
              <td>${p.nome}</td>
              <td>${p.email}</td>
              <td>${(p.disciplinas||[]).map(id=>getData('disciplinas').find(d=>d.id===id)?.nome).join(', ')}</td>
              <td>${(p.turmas||[]).map(id=>getData('turmas').find(t=>t.id===id)?.nome).join(', ')}</td>
              <td class="actions">
                <button onclick="editProf('${p.id}')">Editar</button>
                <button class="danger" onclick="deleteProf('${p.id}')">Excluir</button>
                <button onclick="viewProf('${p.id}')">Ver</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div id="prof-modal" style="display:none"></div>
  `;
  document.getElementById('prof-form').onsubmit = saveProf;
}
function saveProf(e) {
  e.preventDefault();
  const form = e.target;
  const prof = {
    id: form.id.value,
    nome: form.nome.value,
    email: form.email.value,
    disciplinas: Array.from(form.disciplinas.selectedOptions).map(o=>o.value),
    turmas: Array.from(form.turmas.selectedOptions).map(o=>o.value)
  };
  fetch('../backend/api/professores.php', {
    method: prof.id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prof)
  })
    .then(async res => {
      let data;
      try { data = await res.json(); } catch { data = {mensagem: await res.text()}; }
      alert(JSON.stringify(data));
      renderProfessores();
    })
    .catch(err => alert('Erro ao salvar professor! ' + err));
}

function editProf(id) {
  fetch(`../backend/api/professores.php?id=${id}`)
    .then(res => res.json())
    .then(prof => {
      const form = document.getElementById('prof-form');
      form.id.value = prof.id;
      form.nome.value = prof.nome;
      form.email.value = prof.email;
      Array.from(form.disciplinas.options).forEach(opt => opt.selected = (prof.disciplinas||[]).includes(opt.value));
      Array.from(form.turmas.options).forEach(opt => opt.selected = (prof.turmas||[]).includes(opt.value));
    });
}

function deleteProf(id) {
  if (confirm('Excluir este professor?')) {
    fetch(`../backend/api/professores.php?id=${id}`, {
      method: 'DELETE'
    })
      .then(async res => {
        let data;
        try { data = await res.json(); } catch { data = {mensagem: await res.text()}; }
        alert(JSON.stringify(data));
        renderProfessores();
      })
      .catch(err => alert('Erro ao excluir professor! ' + err));
  }
}

function viewProf(id) {
  fetch(`../backend/api/professores.php?id=${id}`)
    .then(res => res.json())
    .then(prof => {
      document.getElementById('prof-modal').style.display = 'block';
      document.getElementById('prof-modal').innerHTML = `
        <div class="card" style="position:fixed;top:20%;left:40%;z-index:10;min-width:300px;">
          <h3>Informações do Professor</h3>
          <p><b>Nome:</b> ${prof.nome}</p>
          <p><b>Email:</b> ${prof.email}</p>
          <p><b>Disciplinas:</b> ${(prof.disciplinas||[]).join(', ')}</p>
          <p><b>Turmas:</b> ${(prof.turmas||[]).join(', ')}</p>
          <button onclick="closeProfModal()">Fechar</button>
        </div>
      `;
    });
}
function editProf(id) {
  const prof = getData('professores').find(p => p.id === id);
  const form = document.getElementById('prof-form');
  form.id.value = prof.id;
  form.nome.value = prof.nome;
  form.email.value = prof.email;
  Array.from(form.disciplinas.options).forEach(opt => opt.selected = (prof.disciplinas||[]).includes(opt.value));
  Array.from(form.turmas.options).forEach(opt => opt.selected = (prof.turmas||[]).includes(opt.value));
}
function deleteProf(id) {
  if (confirm('Excluir este professor?')) {
    setData('professores', getData('professores').filter(p => p.id !== id));
    renderProfessores();
  }
}
function viewProf(id) {
  const prof = getData('professores').find(p => p.id === id);
  document.getElementById('prof-modal').style.display = 'block';
  document.getElementById('prof-modal').innerHTML = `
    <div class="card" style="position:fixed;top:20%;left:40%;z-index:10;min-width:300px;">
      <h3>Informações do Professor</h3>
      <p><b>Nome:</b> ${prof.nome}</p>
      <p><b>Email:</b> ${prof.email}</p>
      <p><b>Disciplinas:</b> ${(prof.disciplinas||[]).map(id=>getData('disciplinas').find(d=>d.id===id)?.nome).join(', ')}</p>
      <p><b>Turmas:</b> ${(prof.turmas||[]).map(id=>getData('turmas').find(t=>t.id===id)?.nome).join(', ')}</p>
      <button onclick="closeProfModal()">Fechar</button>
    </div>
  `;
}
function closeProfModal() {
  document.getElementById('prof-modal').style.display = 'none';
}

// ----------- CURSOS -----------
function renderCursos() {
  const cursos = getData('cursos');
  document.getElementById('page-content').innerHTML = `
    <div class="card">
      <h3>Cursos</h3>
      <form id="curso-form">
        <input type="hidden" name="id">
        <div class="form-group">
          <label>Nome</label>
          <input name="nome" required>
        </div>
        <div class="form-group">
          <label>Descrição</label>
          <input name="descricao">
        </div>
        <button type="submit">Salvar</button>
        <button type="reset">Limpar</button>
      </form>
      <table class="table">
        <thead>
          <tr>
            <th>Nome</th><th>Descrição</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${cursos.map(c => `
            <tr>
              <td>${c.nome}</td>
              <td>${c.descricao}</td>
              <td class="actions">
                <button onclick="editCurso('${c.id}')">Editar</button>
                <button class="danger" onclick="deleteCurso('${c.id}')">Excluir</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  document.getElementById('curso-form').onsubmit = saveCurso;
}
function saveCurso(e) {
  e.preventDefault();
  const form = e.target;
  let cursos = getData('cursos');
  const id = form.id.value || Date.now().toString();
  const curso = {
    id,
    nome: form.nome.value,
    descricao: form.descricao.value
  };
  if (form.id.value) {
    cursos = cursos.map(c => c.id === id ? curso : c);
  } else {
    cursos.push(curso);
  }
  setData('cursos', cursos);
  renderCursos();
}
function editCurso(id) {
  const curso = getData('cursos').find(c => c.id === id);
  const form = document.getElementById('curso-form');
  form.id.value = curso.id;
  form.nome.value = curso.nome;
  form.descricao.value = curso.descricao;
}
function deleteCurso(id) {
  if (confirm('Excluir este curso?')) {
    setData('cursos', getData('cursos').filter(c => c.id !== id));
    renderCursos();
  }
}

// ----------- DISCIPLINAS -----------
function renderDisciplinas() {
  const disciplinas = getData('disciplinas');
  document.getElementById('page-content').innerHTML = `
    <div class="card">
      <h3>Disciplinas</h3>
      <form id="disc-form">
        <input type="hidden" name="id">
        <div class="form-group">
          <label>Nome</label>
          <input name="nome" required>
        </div>
        <div class="form-group">
          <label>Curso</label>
          <select name="curso" required>
            <option value="">Selecione</option>
            ${getData('cursos').map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
          </select>
        </div>
        <button type="submit">Salvar</button>
        <button type="reset">Limpar</button>
      </form>
      <table class="table">
        <thead>
          <tr>
            <th>Nome</th><th>Curso</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${disciplinas.map(d => `
            <tr>
              <td>${d.nome}</td>
              <td>${getData('cursos').find(c=>c.id===d.curso)?.nome||''}</td>
              <td class="actions">
                <button onclick="editDisc('${d.id}')">Editar</button>
                <button class="danger" onclick="deleteDisc('${d.id}')">Excluir</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  document.getElementById('disc-form').onsubmit = saveDisc;
}
function saveDisc(e) {
  e.preventDefault();
  const form = e.target;
  let disciplinas = getData('disciplinas');
  const id = form.id.value || Date.now().toString();
  const disc = {
    id,
    nome: form.nome.value,
    curso: form.curso.value
  };
  if (form.id.value) {
    disciplinas = disciplinas.map(d => d.id === id ? disc : d);
  } else {
    disciplinas.push(disc);
  }
  setData('disciplinas', disciplinas);
  renderDisciplinas();
}
function editDisc(id) {
  const disc = getData('disciplinas').find(d => d.id === id);
  const form = document.getElementById('disc-form');
  form.id.value = disc.id;
  form.nome.value = disc.nome;
  form.curso.value = disc.curso;
}
function deleteDisc(id) {
  if (confirm('Excluir esta disciplina?')) {
    setData('disciplinas', getData('disciplinas').filter(d => d.id !== id));
    renderDisciplinas();
  }
}

// ----------- TURMAS -----------
function renderTurmas() {
  const turmas = getData('turmas');
  document.getElementById('page-content').innerHTML = `
    <div class="card">
      <h3>Turmas</h3>
      <form id="turma-form">
        <input type="hidden" name="id">
        <div class="form-group">
          <label>Nome</label>
          <input name="nome" required>
        </div>
        <div class="form-group">
          <label>Curso</label>
          <select name="curso" required>
            <option value="">Selecione</option>
            ${getData('cursos').map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Ano</label>
          <input name="ano" type="number" required>
        </div>
        <button type="submit">Salvar</button>
        <button type="reset">Limpar</button>
      </form>
      <table class="table">
        <thead>
          <tr>
            <th>Nome</th><th>Curso</th><th>Ano</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${turmas.map(t => `
            <tr>
              <td>${t.nome}</td>
              <td>${getData('cursos').find(c=>c.id===t.curso)?.nome||''}</td>
              <td>${t.ano}</td>
              <td class="actions">
                <button onclick="editTurma('${t.id}')">Editar</button>
                <button class="danger" onclick="deleteTurma('${t.id}')">Excluir</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  document.getElementById('turma-form').onsubmit = saveTurma;
}
function saveTurma(e) {
  e.preventDefault();
  const form = e.target;
  let turmas = getData('turmas');
  const id = form.id.value || Date.now().toString();
  const turma = {
    id,
    nome: form.nome.value,
    curso: form.curso.value,
    ano: form.ano.value
  };
  if (form.id.value) {
    turmas = turmas.map(t => t.id === id ? turma : t);
  } else {
    turmas.push(turma);
  }
  setData('turmas', turmas);
  renderTurmas();
}
function editTurma(id) {
  const turma = getData('turmas').find(t => t.id === id);
  const form = document.getElementById('turma-form');
  form.id.value = turma.id;
  form.nome.value = turma.nome;
  form.curso.value = turma.curso;
  form.ano.value = turma.ano;
}
function deleteTurma(id) {
  if (confirm('Excluir esta turma?')) {
    setData('turmas', getData('turmas').filter(t => t.id !== id));
    renderTurmas();
  }
}

// ----------- MATRÍCULAS -----------
function renderMatriculas() {
  const matriculas = getData('matriculas');
  document.getElementById('page-content').innerHTML = `
    <div class="card">
      <h3>Matrículas</h3>
      <form id="matricula-form">
        <input type="hidden" name="id">
        <div class="form-group">
          <label>Aluno</label>
          <select name="alunoId" required>
            <option value="">Selecione</option>
            ${getData('alunos').map(a => `<option value="${a.id}">${a.nome}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Disciplina</label>
          <select name="disciplinaId" required>
            <option value="">Selecione</option>
            ${getData('disciplinas').map(d => `<option value="${d.id}">${d.nome}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Turma</label>
          <select name="turmaId" required>
            <option value="">Selecione</option>
            ${getData('turmas').map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
          </select>
        </div>
        <button type="submit">Inscrever</button>
      </form>
      <table class="table">
        <thead>
          <tr>
            <th>Aluno</th><th>Disciplina</th><th>Turma</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${matriculas.map(m => `
            <tr>
              <td>${getData('alunos').find(a=>a.id===m.alunoId)?.nome||''}</td>
              <td>${getData('disciplinas').find(d=>d.id===m.disciplinaId)?.nome||''}</td>
              <td>${getData('turmas').find(t=>t.id===m.turmaId)?.nome||''}</td>
              <td class="actions">
                <button class="danger" onclick="deleteMatricula('${m.id}')">Cancelar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <hr>
      <h4>Lista de Alunos por Turma</h4>
      <div>
        ${getData('turmas').map(turma => `
          <b>${turma.nome}:</b> 
          ${matriculas.filter(m=>m.turmaId===turma.id)
            .map(m=>getData('alunos').find(a=>a.id===m.alunoId)?.nome)
            .filter(Boolean).join(', ') || 'Nenhum aluno'}
          <br>
        `).join('')}
      </div>
    </div>
  `;
  document.getElementById('matricula-form').onsubmit = saveMatricula;
}
function saveMatricula(e) {
  e.preventDefault();
  const form = e.target;
  let matriculas = getData('matriculas');
  const id = Date.now().toString();
  const matricula = {
    id,
    alunoId: form.alunoId.value,
    disciplinaId: form.disciplinaId.value,
    turmaId: form.turmaId.value
  };
  // Evitar duplicidade
  if (matriculas.some(m => m.alunoId === matricula.alunoId && m.disciplinaId === matricula.disciplinaId && m.turmaId === matricula.turmaId)) {
    alert('Já existe matrícula para este aluno nesta disciplina/turma.');
    return;
  }
  matriculas.push(matricula);
  setData('matriculas', matriculas);
  renderMatriculas();
}
function deleteMatricula(id) {
  if (confirm('Cancelar esta matrícula?')) {
    setData('matriculas', getData('matriculas').filter(m => m.id !== id));
    renderMatriculas();
  }
}

// ----------- LOGOUT -----------
document.getElementById('logout').onclick = () => {
  if (confirm('Deseja sair?')) location.reload();
};

// Expor funções globais para onclick
window.editAluno = editAluno;
window.deleteAluno = deleteAluno;
window.viewAluno = viewAluno;
window.closeAlunoModal = closeAlunoModal;

window.editProf = editProf;
window.deleteProf = deleteProf;
window.viewProf = viewProf;
window.closeProfModal = closeProfModal;

window.editCurso = editCurso;
window.deleteCurso = deleteCurso;

window.editDisc = editDisc;
window.deleteDisc = deleteDisc;

window.editTurma = editTurma;
window.deleteTurma = deleteTurma;

window.deleteMatricula = deleteMatricula;