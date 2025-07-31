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
    $stmt = $pdo->query('SELECT * FROM turmas');
    $turmas = $stmt->fetchAll();
    echo json_encode($turmas);
    break;

  case 'POST':
    $dados = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('INSERT INTO turmas (nome, semestre, ano, id_disciplina, id_SIAPE) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([
      $dados['nome'] ?? '',
      $dados['semestre'] ?? '',
      $dados['ano'] ?? null,
      $dados['id_disciplina'] ?? null,
      $dados['id_SIAPE'] ?? null
    ]);
    echo json_encode(['mensagem' => 'Turma cadastrada']);
    break;

  case 'PUT':
    $dados = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('UPDATE turmas SET nome=?, semestre=?, ano=?, id_disciplina=?, id_SIAPE=? WHERE id_turma=?');
    $stmt->execute([
      $dados['nome'] ?? '',
      $dados['semestre'] ?? '',
      $dados['ano'] ?? null,
      $dados['id_disciplina'] ?? null,
      $dados['id_SIAPE'] ?? null,
      $dados['id_turma']
    ]);
    echo json_encode(['mensagem' => 'Turma atualizada']);
    break;

  case 'DELETE':
    $dados = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('DELETE FROM turmas WHERE id_turma=?');
    $stmt->execute([$dados['id_turma']]);
    echo json_encode(['mensagem' => 'Turma excluída']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
}