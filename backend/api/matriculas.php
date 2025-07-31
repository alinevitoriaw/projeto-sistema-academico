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

try {
  switch ($metodo) {
    case 'GET':
      $stmt = $pdo->query('SELECT * FROM matricula');
      $matriculas = $stmt->fetchAll();
      echo json_encode($matriculas);
      break;

    case 'POST':
      $dados = json_decode(file_get_contents('php://input'), true);
      $stmt = $pdo->prepare('INSERT INTO matricula (id_turma, data_matricula, status) VALUES (?, ?, ?)');
      $stmt->execute([
        $dados['id_turma'] ?? null,
        $dados['data_matricula'] ?? date('Y-m-d'),
        $dados['status'] ?? 'ativa'
      ]);
      echo json_encode(['mensagem' => 'Matrícula criada com sucesso']);
      break;

    case 'PUT':
      $dados = json_decode(file_get_contents('php://input'), true);
      $stmt = $pdo->prepare('UPDATE matricula SET id_turma=?, data_matricula=?, status=? WHERE id_matricula=?');
      $stmt->execute([
        $dados['id_turma'] ?? null,
        $dados['data_matricula'] ?? date('Y-m-d'),
        $dados['status'] ?? 'ativa',
        $dados['id_matricula']
      ]);
      echo json_encode(['mensagem' => 'Matrícula atualizada']);
      break;

    case 'DELETE':
      $dados = json_decode(file_get_contents('php://input'), true);
      $stmt = $pdo->prepare('DELETE FROM matricula WHERE id_matricula=?');
      $stmt->execute([$dados['id_matricula']]);
      echo json_encode(['mensagem' => 'Matrícula excluída']);
      break;

    default:
      http_response_code(405);
      echo json_encode(['mensagem' => 'Método não permitido']);
  }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['erro' => $e->getMessage()]);
}