// Utilidades para localStorage
// getData e setData não serão usados para alunos (apenas entidades ainda não integradas ao backend)
async function getData(key) {
  let endpoint = '';
  switch (key) {
    case 'alunos': endpoint = 'http://localhost:8000/alunos.php'; break;
    case 'cursos': endpoint = 'http://localhost:8000/cursos.php'; break;
    case 'professores': endpoint = 'http://localhost:8000/professores.php'; break;
    case 'disciplinas': endpoint = 'http://localhost:8000/disciplinas.php'; break;
    case 'turmas': endpoint = 'http://localhost:8000/turmas.php'; break;
    case 'matriculas': endpoint = 'http://localhost:8000/matriculas.php'; break;
    default: return [];
  }
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error('Erro ao buscar dados do backend');
    return await res.json();
  } catch (err) {
    alert('Erro ao buscar ' + key + ': ' + err.message);
    return [];
  }
}
async function setData(key, data) {
  let endpoint = '';
  switch (key) {
    case 'alunos': endpoint = 'http://localhost:8000/alunos.php'; break;
    case 'cursos': endpoint = 'http://localhost:8000/cursos.php'; break;
    case 'professores': endpoint = 'http://localhost:8000/professores.php'; break;
    case 'disciplinas': endpoint = 'http://localhost:8000/disciplinas.php'; break;
    case 'turmas': endpoint = 'http://localhost:8000/turmas.php'; break;
    case 'matriculas': endpoint = 'http://localhost:8000/matriculas.php'; break;
    default: return;
  }
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Erro ao salvar dados no backend');
    return await res.json();
  } catch (err) {
    alert('Erro ao salvar ' + key + ': ' + err.message);
  }
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

async function renderInicio() {
  const [alunos, professores, cursos, disciplinas, turmas, matriculas] = await Promise.all([
    getData('alunos'),
    getData('professores'),
    getData('cursos'),
    getData('disciplinas'),
    getData('turmas'),
    getData('matriculas')
  ]);
  document.getElementById('page-content').innerHTML = `
    <div class="card">
      <h3>Dashboard</h3>
      <div style="display: flex; gap: 30px; flex-wrap: wrap;">
        <div>
          <strong>Alunos:</strong> ${alunos.length}<br>
          <strong>Professores:</strong> ${professores.length}<br>
          <strong>Cursos:</strong> ${cursos.length}<br>
          <strong>Disciplinas:</strong> ${disciplinas.length}<br>
          <strong>Turmas:</strong> ${turmas.length}<br>
        </div>
        <div>
          <strong>Matrículas:</strong> ${matriculas.length}
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
          <td>${aluno.turma || ''}</td>
          <td>
            <button onclick=\"editAluno('${aluno.id}')\">Editar</button>
            <button onclick=\"deleteAluno('${aluno.id}')\">Excluir</button>
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
    id_matricula: form.id.value,
    nome: form.nome.value,
    cpf: form.cpf ? form.cpf.value : '',
    data_nascimento: form.data_nascimento ? form.data_nascimento.value : '',
    email: form.email.value,
    telefone: form.telefone ? form.telefone.value : '',
    turma: form.turma ? form.turma.value : ''
  };
  // Se id preenchido, é edição (PUT), senão é criação (POST)
  const method = aluno.id_matricula ? 'PUT' : 'POST';
  fetch('http://localhost:8000/alunos.php', {
    method,
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
  Promise.all([
    fetch('http://localhost:8000/alunos.php').then(res => res.json()),
    fetch('http://localhost:8000/turmas.php').then(res => res.json())
  ]).then(([alunos, turmas]) => {
    // Aqui, id_matricula é o identificador único do aluno retornado pelo backend
    const aluno = alunos.find(a => String(a.id) === String(matricula) || String(a.id_matricula) === String(matricula));
    if (!aluno) return alert('Aluno não encontrado!');
    const form = document.getElementById('aluno-form');
    form.id.value = aluno.id || aluno.id_matricula || '';
    form.nome.value = aluno.nome || '';
    form.cpf.value = aluno.cpf || '';
    form.data_nascimento.value = aluno.data_nascimento || '';
    form.email.value = aluno.email || '';
    form.telefone.value = aluno.telefone || '';
    if (form.turma) {
      form.turma.innerHTML = `<option value="">Selecione</option>` +
        turmas.map(t => `<option value="${t.id_turma}">${t.nome}</option>`).join('');
      form.turma.value = aluno.turma || '';
    }
    form.scrollIntoView({ behavior: 'smooth' });
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
      <p><b>Turma:</b> ${turma?.nome || ''}</p>
      <button onclick="closeAlunoModal()">Fechar</button>
    </div>
  `;
}
function closeAlunoModal() {
  document.getElementById('aluno-modal').style.display = 'none';
}

// ----------- PROFESSORES -----------
function renderProfessores() {
  fetch('http://localhost:8000/professores.php')
    .then(res => res.json())
    .then(professores => {
      document.getElementById('page-content').innerHTML = `
        <div class="card">
          <h3>Professores</h3>
          <form id="prof-form">
            <input type="hidden" name="id_SIAPE">
            <div class="form-group">
              <label>Nome</label>
              <input name="nome" required>
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
              <label>Email</label>
              <input name="email" type="email" required>
            </div>
            <div class="form-group">
              <label>Telefone</label>
              <input name="telefone" required>
            </div>
            <div class="form-group">
              <label>Endereço</label>
              <input name="endereco" required>
            </div>
            <button type="submit">Salvar</button>
            <button type="reset">Limpar</button>
          </form>
          <table class="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>CPF</th>
                <th>Data de Nascimento</th>
                <th>Telefone</th>
                <th>Endereço</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody id="professores-tbody"></tbody>
          </table>
        </div>
      `;
      // Renderiza professores na tabela
      const tbody = document.getElementById('professores-tbody');
      professores.forEach(prof => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${prof.nome}</td>
          <td>${prof.email}</td>
          <td>${prof.cpf}</td>
          <td>${prof.data_nascimento}</td>
          <td>${prof.telefone}</td>
          <td>${prof.endereco}</td>
          <td>
            <button type="button" onclick="editProf('${prof.id_SIAPE}')">Editar</button>
            <button type="button" onclick="deleteProf('${prof.id_SIAPE}')">Excluir</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      document.getElementById('prof-form').onsubmit = saveProf;
    });
}
async function saveProf(e) {
  e.preventDefault();
  const form = e.target;
  const prof = {
    id_SIAPE: form.id_SIAPE && form.id_SIAPE.value ? form.id_SIAPE.value : undefined,
    nome: form.nome.value,
    cpf: form.cpf.value,
    data_nascimento: form.data_nascimento.value,
    email: form.email.value,
    telefone: form.telefone.value,
    endereco: form.endereco.value
  };
  const method = prof.id_SIAPE ? 'PUT' : 'POST';
  fetch('http://localhost:8000/professores.php', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prof)
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
      renderProfessores();
    })
    .catch(err => alert('Erro ao salvar professor! ' + err));
}

function editProf(id_SIAPE) {
  fetch('http://localhost:8000/professores.php')
    .then(res => res.json())
    .then(professores => {
      const prof = professores.find(p => String(p.id_SIAPE) === String(id_SIAPE));
      if (!prof) return alert('Professor não encontrado!');
      const form = document.getElementById('prof-form');
      console.log('ANTES:', form.id_SIAPE.value, form.nome.value);
      form.id_SIAPE.value = prof.id_SIAPE || '';
      form.nome.value = prof.nome || '';
      form.cpf.value = prof.cpf || '';
      form.data_nascimento.value = prof.data_nascimento || '';
      form.email.value = prof.email || '';
      form.telefone.value = prof.telefone || '';
      form.endereco.value = prof.endereco || '';
      console.log('DEPOIS:', form.id_SIAPE.value, form.nome.value);
    });
}

function deleteProf(id_SIAPE) {
  if (confirm('Excluir este professor?')) {
    fetch('http://localhost:8000/professores.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_SIAPE })
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
          <p><b>Disciplinas:</b> ${(prof.disciplinas || []).join(', ')}</p>
          <p><b>Turmas:</b> ${(prof.turmas || []).join(', ')}</p>
          <button onclick="closeProfModal()">Fechar</button>
        </div>
      `;
    });
}
function viewProf(id) {
  const prof = getData('professores').find(p => p.id === id);
  document.getElementById('prof-modal').style.display = 'block';
  document.getElementById('prof-modal').innerHTML = `
    <div class="card" style="position:fixed;top:20%;left:40%;z-index:10;min-width:300px;">
      <h3>Informações do Professor</h3>
      <p><b>Nome:</b> ${prof.nome}</p>
      <p><b>Email:</b> ${prof.email}</p>
      <p><b>Disciplinas:</b> ${(prof.disciplinas || []).map(id => getData('disciplinas').find(d => d.id === id)?.nome).join(', ')}</p>
      <p><b>Turmas:</b> ${(prof.turmas || []).map(id => getData('turmas').find(t => t.id === id)?.nome).join(', ')}</p>
      <button onclick="closeProfModal()">Fechar</button>
    </div>
  `;
}
function closeProfModal() {
  document.getElementById('prof-modal').style.display = 'none';
}

// ----------- CURSOS -----------
function renderCursos() {
  fetch('http://localhost:8000/cursos.php')
    .then(res => res.json())
    .then(cursos => {
      document.getElementById('page-content').innerHTML = `
        <div class="card">
          <h3>Cursos</h3>
          <form id="curso-form">
            <input type="hidden" name="id_curso">
            <div class="form-group">
              <label>Nome do Curso</label>
              <input name="nome_curso" required>
            </div>
            <div class="form-group">
              <label>Descrição</label>
              <input name="descricao_curso" required>
            </div>
            <div class="form-group">
              <label>Carga Horária</label>
              <input name="carga_horaria" required>
            </div>
            <button type="submit">Salvar</button>
          </form>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Carga Horária</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${cursos.map(curso => `
                <tr>
                  <td>${curso.id_curso}</td>
                  <td>${curso.nome_curso}</td>
                  <td>${curso.descricao_curso}</td>
                  <td>${curso.carga_horaria}</td>
                  <td>
                    <button onclick="editCurso('${curso.id_curso}')">Editar</button>
                    <button onclick="deleteCurso('${curso.id_curso}')">Excluir</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      document.getElementById('curso-form').onsubmit = saveCurso;
    });
}

async function saveCurso(e) {
  e.preventDefault();
  const form = e.target;
  // Monta o objeto curso SEM id_curso inicialmente
  const curso = {
    nome_curso: form.nome_curso.value,
    descricao_curso: form.descricao_curso.value,
    carga_horaria: form.carga_horaria.value
  };
  // Só adiciona id_curso se for edição (campo preenchido)
  if (form.id_curso.value) {
    curso.id_curso = form.id_curso.value;
  }

  // Define o método
  const method = form.id_curso.value ? 'PUT' : 'POST';

  try {
    const res = await fetch('http://localhost:8000/cursos.php', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(curso)
    });
    let data = {};
    if (res.ok) {
      try { data = await res.json(); }
      catch { data = { mensagem: 'Erro ao interpretar JSON.' }; }
    } else {
      data = { mensagem: 'Erro na requisição: ' + res.status };
    }
    alert(JSON.stringify(data));
    renderCursos();
  } catch (err) {
    alert('Erro ao cadastrar/atualizar curso! ' + err);
  }
}

function editCurso(id_curso) {
  fetch('http://localhost:8000/cursos.php')
    .then(res => res.json())
    .then(cursos => {
      const curso = cursos.find(c => String(c.id_curso) === String(id_curso));
      if (!curso) return alert('Curso não encontrado!');
      const form = document.getElementById('curso-form');
      form.id_curso.value = curso.id_curso;
      form.nome_curso.value = curso.nome_curso;
      form.descricao_curso.value = curso.descricao_curso;
      form.carga_horaria.value = curso.carga_horaria;
    });
}

function deleteCurso(id_curso) {
  if (confirm('Excluir este curso?')) {
    fetch('http://localhost:8000/cursos.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_curso })
    })
      .then(res => {
        if (res.ok) {
          alert('Curso excluído com sucesso!');
          renderCursos();
        } else {
          alert('Erro ao excluir curso!');
        }
      })
      .catch(err => alert('Erro ao excluir curso! ' + err));
  }
}

window.editCurso = editCurso;
window.deleteCurso = deleteCurso;

async function saveCurso(e) {
  e.preventDefault();
  const form = e.target;
  const curso = {
    id_curso: form.id_curso.value || undefined,
    nome_curso: form.nome_curso.value,
    descricao_curso: form.descricao_curso.value,
    carga_horaria: form.carga_horaria.value
  };
  const method = curso.id_curso ? 'PUT' : 'POST';
  try {
    const res = await fetch('http://localhost:8000/cursos.php', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(curso)
    });
    let data = {};
    if (res.ok) {
      try { data = await res.json(); }
      catch { data = { mensagem: 'Erro ao interpretar JSON.' }; }
    } else {
      data = { mensagem: 'Erro na requisição: ' + res.status };
    }
    alert(JSON.stringify(data));
    renderCursos();
  } catch (err) {
    alert('Erro ao cadastrar/atualizar curso! ' + err);
  }
}
async function editCurso(id_curso) {
  const cursos = await getData('cursos');
  const curso = cursos.find(c => String(c.id_curso) === String(id_curso));
  if (!curso) return alert('Curso não encontrado!');
  const form = document.getElementById('curso-form');
  form.id_curso.value = curso.id_curso;
  form.nome_curso.value = curso.nome_curso;
  form.descricao_curso.value = curso.descricao_curso;
  form.carga_horaria.value = curso.carga_horaria;
}
async function deleteCurso(id_curso) {
  if (confirm('Excluir este curso?')) {
    try {
      const res = await fetch('http://localhost:8000/cursos.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_curso })
      });
      if (res.ok) {
        alert('Curso excluído com sucesso!');
        renderCursos();
      } else {
        alert('Erro ao excluir curso!');
      }
    } catch (err) {
      alert('Erro ao excluir curso! ' + err);
    }
  }
}

// ----------- DISCIPLINAS -----------
function renderDisciplinas() {
  // Busca cursos e disciplinas em paralelo
  Promise.all([
    fetch('http://localhost:8000/cursos.php').then(res => res.json()),
    fetch('http://localhost:8000/disciplina.php').then(res => res.json())
  ]).then(([cursos, disciplina]) => {
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
            <label>Descrição</label>
            <input name="descricao" required>
          </div>
          <div class="form-group">
            <label>Carga horária</label>
            <input name="carga_horaria" required>
          </div>
          <div class="form-group">
            <label>Curso</label>
            <select name="curso" required>
              <option value="">Selecione</option>
              ${cursos.map(c => `<option value="${c.id_curso}">${c.nome_curso}</option>`).join('')}
            </select>
          </div>
          <button type="submit">Salvar</button>
          <button type="reset">Limpar</button>
        </form>
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Carga horária</th>
              <th>Curso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${disciplina.map(d => `
              <tr>
                <td>${d.nome}</td>
                <td>${d.descricao}</td>
                <td>${d.carga_horaria}</td>
                <td>${cursos.find(c => String(c.id_curso) === String(d.id_curso))?.nome_curso || ''}</td>
                <td class="actions">
                  <button onclick="editDisc('${d.id_disciplina}')">Editar</button>
                  <button class="danger" onclick="deleteDisc('${d.id_disciplina}')">Excluir</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    document.getElementById('disc-form').onsubmit = saveDisc;
  });
}
async function saveDisc(e) {
  e.preventDefault();
  const form = e.target;
  // Monta o objeto disciplina SEM id_disciplina inicialmente
  const disciplina = {
    nome: form.nome.value,
    descricao: form.descricao.value,
    carga_horaria: form.carga_horaria.value,
    id_curso: form.curso.value
  };
  // Só adiciona id_disciplina se for edição
  if (form.id.value) {
    disciplina.id_disciplina = form.id.value;
  }

  const method = form.id.value ? 'PUT' : 'POST';

  try {
    const res = await fetch('http://localhost:8000/disciplina.php', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(disciplina)
    });
    let data = {};
    if (res.ok) {
      try { data = await res.json(); }
      catch { data = { mensagem: 'Erro ao interpretar JSON.' }; }
    } else {
      data = { mensagem: 'Erro na requisição: ' + res.status };
    }
    alert(JSON.stringify(data));
    renderDisciplinas();
  } catch (err) {
    alert('Erro ao cadastrar/atualizar disciplina! ' + err);
  }
}

async function editDisc(id_disciplina) {
  // Busca disciplinas e cursos do backend
  const [disciplinas, cursos] = await Promise.all([
    fetch('http://localhost:8000/disciplina.php').then(res => res.json()),
    fetch('http://localhost:8000/cursos.php').then(res => res.json())
  ]);
  const disc = disciplinas.find(d => String(d.id_disciplina) === String(id_disciplina));
  if (!disc) return alert('Disciplina não encontrada!');

  // Preenche o formulário
  const form = document.getElementById('disc-form');
  form.id.value = disc.id_disciplina;
  form.nome.value = disc.nome;
  form.descricao.value = disc.descricao;
  form.carga_horaria.value = disc.carga_horaria;

  // Atualiza o select de cursos e seleciona o correto
  const select = form.curso;
  // Limpa opções antigas, exceto a primeira
  select.innerHTML = `<option value="">Selecione</option>` +
    cursos.map(c => `<option value="${c.id_curso}">${c.nome_curso}</option>`).join('');
  select.value = disc.id_curso;
}

async function deleteDisc(id_disciplina) {
  if (confirm('Excluir esta disciplina?')) {
    try {
      const res = await fetch('http://localhost:8000/disciplina.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_disciplina })
      });
      if (res.ok) {
        alert('Disciplina excluída com sucesso!');
        renderDisciplinas();
      } else {
        alert('Erro ao excluir disciplina!');
      }
    } catch (err) {
      alert('Erro ao excluir disciplina! ' + err);
    }
  }
}

// ----------- TURMAS -----------
function renderTurmas() {
  // Busca turmas, disciplinas e professores em paralelo
  Promise.all([
    fetch('http://localhost:8000/turmas.php').then(res => res.json()),
    fetch('http://localhost:8000/disciplina.php').then(res => res.json()),
    fetch('http://localhost:8000/professores.php').then(res => res.json())
  ]).then(([turmas, disciplinas, professores]) => {
    document.getElementById('page-content').innerHTML = `
      <div class="card">
        <h3>Turmas</h3>
        <form id="turma-form">
          <input type="hidden" name="id_turma">
          <div class="form-group">
            <label>Nome</label>
            <input name="nome" required>
          </div>
          <div class="form-group">
            <label>Semestre</label>
            <input name="semestre" required>
          </div>
          <div class="form-group">
            <label>Ano</label>
            <input name="ano" required>
          </div>
          <div class="form-group">
            <label>Disciplina</label>
            <select name="id_disciplina" required>
              <option value="">Selecione</option>
              ${disciplinas.map(d => `<option value="${d.id_disciplina}">${d.nome}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Professor (SIAPE)</label>
            <select name="id_SIAPE" required>
              <option value="">Selecione</option>
              ${professores.map(p => `<option value="${p.id_SIAPE}">${p.nome} (${p.id_SIAPE})</option>`).join('')}
            </select>
          </div>
          <button type="submit">Salvar</button>
          <button type="reset">Limpar</button>
        </form>
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Semestre</th>
              <th>Ano</th>
              <th>Disciplina</th>
              <th>Professor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="turmas-tbody"></tbody>
        </table>
      </div>
    `;
    // Renderiza turmas na tabela
    const tbody = document.getElementById('turmas-tbody');
    turmas.forEach(turma => {
      const disciplina = disciplinas.find(d => String(d.id_disciplina) === String(turma.id_disciplina));
      const professor = professores.find(p => String(p.id_SIAPE) === String(turma.id_SIAPE));
      const nomeDisciplina = disciplina ? disciplina.nome : turma.id_disciplina;
      const nomeProfessor = professor ? professor.nome : turma.id_SIAPE;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${turma.nome}</td>
        <td>${turma.semestre}</td>
        <td>${turma.ano}</td>
        <td>${nomeDisciplina}</td>
        <td>${nomeProfessor}</td>
        <td>
          <button type="button" onclick="editTurma('${turma.id_turma}')">Editar</button>
          <button type="button" onclick="deleteTurma('${turma.id_turma}')">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    document.getElementById('turma-form').onsubmit = saveTurma;
  });
}
async function saveTurma(e) {
  e.preventDefault();
  const form = e.target;
  const turma = {
    id_turma: form.id_turma && form.id_turma.value ? form.id_turma.value : undefined,
    nome: form.nome.value,
    semestre: form.semestre.value,
    ano: form.ano.value,
    id_disciplina: form.id_disciplina.value,
    id_SIAPE: form.id_SIAPE.value
  };
  const method = turma.id_turma ? 'PUT' : 'POST';
  fetch('http://localhost:8000/turmas.php', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(turma)
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
      renderTurmas();
    })
    .catch(err => alert('Erro ao salvar turma! ' + err));
}
function editTurma(id_turma) {
  // Busca turmas, disciplinas e professores em paralelo
  Promise.all([
    fetch('http://localhost:8000/turmas.php').then(res => res.json()),
    fetch('http://localhost:8000/disciplina.php').then(res => res.json()),
    fetch('http://localhost:8000/professores.php').then(res => res.json())
  ]).then(([turmas, disciplinas, professores]) => {
    const turma = turmas.find(t => String(t.id_turma) === String(id_turma));
    if (!turma) return alert('Turma não encontrada!');
    const form = document.getElementById('turma-form');
    form.id_turma.value = turma.id_turma || '';
    form.nome.value = turma.nome || '';
    form.semestre.value = turma.semestre || '';
    form.ano.value = turma.ano || '';
    // Atualiza os selects para garantir que as opções estão corretas
    form.id_disciplina.value = turma.id_disciplina || '';
    form.id_SIAPE.value = turma.id_SIAPE || '';
    form.scrollIntoView({ behavior: 'smooth' });
  });
}
function deleteTurma(id_turma) {
  if (confirm('Excluir esta turma?')) {
    fetch('http://localhost:8000/turmas.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_turma })
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
        renderTurmas();
      })
      .catch(err => alert('Erro ao excluir turma! ' + err));
  }
}

// ----------- MATRÍCULAS -----------
async function renderMatriculas() {
  // Busca dados do backend em paralelo
  const [matriculas, alunos, turmas] = await Promise.all([
    fetch('http://localhost:8000/matriculas.php').then(res => res.json()),
    fetch('http://localhost:8000/alunos.php').then(res => res.json()),
    fetch('http://localhost:8000/turmas.php').then(res => res.json())
  ]);

  document.getElementById('page-content').innerHTML = `
    <div class="card">
      <h3>Matrículas</h3>
      <form id="matricula-form">
        <input type="hidden" name="id_matricula">
        <div class="form-group">
          <label>Aluno</label>
          <select name="id_matricula" required>
            <option value="">Selecione</option>
            ${alunos.map(a => `<option value="${a.id_matricula}">${a.nome}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Turma</label>
          <select name="id_turma" required>
            <option value="">Selecione</option>
            ${turmas.map(t => `<option value="${t.id_turma}">${t.nome}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select name="status" required>
            <option value="Ativa">Ativa</option>
            <option value="Trancada">Trancada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
        <button type="submit">Inscrever</button>
      </form>
      <table class="table">
        <thead>
          <tr>
            <th>Aluno</th><th>Turma</th><th>Status</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${matriculas.map(m => `
            <tr>
              <td>${alunos.find(a => String(a.id_matricula) === String(m.id_matricula))?.nome || ''}</td>
              <td>${turmas.find(t => String(t.id_turma) === String(m.id_turma))?.nome || ''}</td>
              <td>${m.status || ''}</td>
              <td class="actions">
                <button class="danger" onclick="deleteMatricula('${m.id_matricula}')">Cancelar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Aqui você pode adicionar o handler do formulário para integração com o backend
  document.getElementById('matricula-form').onsubmit = saveMatricula;
}
async function saveMatricula(e) {
  e.preventDefault();
  const form = e.target;
  const matricula = {
    id_matricula: form.id_matricula && form.id_matricula.value ? form.id_matricula.value : undefined,
    id_turma: form.id_turma.value,
    
    data_matricula: form.data_matricula.value,
    status: form.status.value
  };
  const method = matricula.id_matricula ? 'PUT' : 'POST';
  try {
    const res = await fetch('http://localhost:8000/matriculas.php', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matricula)
    });
    let data = {};
    if (res.ok) {
      try { data = await res.json(); }
      catch { data = { mensagem: 'Erro ao interpretar JSON.' }; }
    } else {
      data = { mensagem: 'Erro na requisição: ' + res.status };
    }
    alert(JSON.stringify(data));
    renderMatriculas();
  } catch (err) {
    alert('Erro ao cadastrar/atualizar matrícula! ' + err);
  }
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