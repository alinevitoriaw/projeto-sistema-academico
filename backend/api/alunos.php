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
    $stmt = $pdo->query('SELECT * FROM aluno');
    $aluno = $stmt->fetchAll();
    echo json_encode($aluno);
    break;

  case 'POST':
    $dados = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('INSERT INTO aluno (nome, cpf, data_nascimento, email, telefone)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nome=VALUES(nome),
          cpf=VALUES(cpf),
          data_nascimento=VALUES(data_nascimento),
          email=VALUES(email),
          telefone=VALUES(telefone)');
      $stmt->execute([
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
    $stmt = $pdo->prepare('UPDATE aluno SET nome=?, cpf=?, data_nascimento=?, email=?, telefone=? WHERE id_matricula=?');
    $stmt->execute([
        $dados['nome'] ?? '',
        $dados['cpf'] ?? '',
        $dados['data_nascimento'] ?? null,
        $dados['email'] ?? '',
        $dados['telefone'] ?? '',
        $dados['id_matricula']
    ]);
    echo json_encode(['mensagem' => 'Aluno atualizado']);
    break;

  case 'DELETE':
    $dados = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('DELETE FROM aluno WHERE id_matricula=?');
    $stmt->execute([$dados['id_matricula']]);
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