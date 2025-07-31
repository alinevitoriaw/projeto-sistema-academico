<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../conexao.php';
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
  case 'GET':
    $stmt = $pdo->query('SELECT * FROM cursos');
    $cursos = $stmt->fetchAll();
    echo json_encode($cursos);
    break;

  case 'POST':
    $dados = json_decode(file_get_contents('php://input'), true);
  
    if (!empty($dados['id_curso'])) {
      // Atualização (upsert)
      $stmt = $pdo->prepare('INSERT INTO cursos (id_curso, nome_curso, descricao_curso, carga_horaria)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          nome_curso=VALUES(nome_curso),
          descricao_curso=VALUES(descricao_curso),
          carga_horaria=VALUES(carga_horaria)');
      $stmt->execute([
        $dados['id_curso'],
        $dados['nome_curso'] ?? '',
        $dados['descricao_curso'] ?? '',
        $dados['carga_horaria'] ?? null
      ]);
      echo json_encode(['mensagem' => 'Curso atualizado com sucesso', 'id_curso' => $dados['id_curso']]);
    } else {
      // Cadastro novo (sem id_curso)
      $stmt = $pdo->prepare('INSERT INTO cursos (nome_curso, descricao_curso, carga_horaria) VALUES (?, ?, ?)');
      $stmt->execute([
        $dados['nome_curso'] ?? '',
        $dados['descricao_curso'] ?? '',
        $dados['carga_horaria'] ?? null
      ]);
      $novo_id = $pdo->lastInsertId();
      echo json_encode(['mensagem' => 'Curso cadastrado com sucesso', 'id_curso' => $novo_id]);
    }
    break;

  case 'PUT':
    $dados = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('UPDATE cursos SET nome_curso=?, descricao_curso=?, carga_horaria=? WHERE id_curso=?');
    $stmt->execute([
      $dados['nome_curso'] ?? '',
      $dados['descricao_curso'] ?? '',
      $dados['carga_horaria'] ?? null,
      $dados['id_curso']
    ]);
    echo json_encode(['mensagem' => 'Curso atualizado']);
    break;

  case 'DELETE':
    $dados = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('DELETE FROM cursos WHERE id_curso=?');
    $stmt->execute([$dados['id_curso'] ?? null]);
    echo json_encode(['mensagem' => 'Curso excluído']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
}