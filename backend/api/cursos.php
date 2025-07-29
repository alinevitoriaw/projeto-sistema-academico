<?php
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
    $stmt = $pdo->prepare('INSERT INTO cursos (nome_curso, descricao_curso, carga_horaria) VALUES (?, ?, ?)');
    $stmt->execute([
      $dados['nome_curso'] ?? '',
      $dados['descricao_curso'] ?? '',
      $dados['carga_horaria'] ?? null
    ]);
    echo json_encode(['mensagem' => 'Curso cadastrado']);
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
    parse_str(file_get_contents('php://input'), $dados);
    $stmt = $pdo->prepare('DELETE FROM cursos WHERE id_curso=?');
    $stmt->execute([$dados['id_curso']]);
    echo json_encode(['mensagem' => 'Curso excluído']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
}