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
    $stmt = $pdo->query('SELECT * FROM alunos');
    $alunos = $stmt->fetchAll();
    echo json_encode($alunos);
    break;

    case 'POST':
      $dados = json_decode(file_get_contents('php://input'), true);
      $stmt = $pdo->prepare('INSERT INTO alunos (matricula, nome, cpf, data_nascimento, email, telefone)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          nome=VALUES(nome),
          cpf=VALUES(cpf),
          data_nascimento=VALUES(data_nascimento),
          email=VALUES(email),
          telefone=VALUES(telefone)');
      $stmt->execute([
          $dados['matricula'] ?? null,
          $dados['nome'] ?? '',
          $dados['cpf'] ?? '',
          $dados['data_nascimento'] ?? null,
          $dados['email'] ?? '',
          $dados['telefone'] ?? ''
      ]);
      echo json_encode(['mensagem' => 'Aluno cadastrado/atualizado com sucesso']);
      break;

  case 'PUT':
    $dados = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('UPDATE alunos SET nome=?, cpf=?, data_nascimento=?, email=?, telefone=? WHERE matricula=?');
    $stmt->execute([
        $dados['nome'] ?? '',
        $dados['cpf'] ?? '',
        $dados['data_nascimento'] ?? null,
        $dados['email'] ?? '',
        $dados['telefone'] ?? '',
        $dados['matricula']
    ]);
    echo json_encode(['mensagem' => 'Aluno atualizado']);
    break;

  case 'DELETE':
    $dados = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('DELETE FROM alunos WHERE matricula=?');
    $stmt->execute([$dados['matricula']]);
    echo json_encode(['mensagem' => 'Aluno excluído']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
  }
} catch (PDOException $e) {
  http_response_code(400);
  echo json_encode(['erro' => $e->getMessage()]);
}