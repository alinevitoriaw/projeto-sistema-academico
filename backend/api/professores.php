<?php
require_once '../conexao.php';
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
  case 'GET':
    $stmt = $pdo->query('SELECT * FROM professores');
    $professores = $stmt->fetchAll();
    echo json_encode($professores);
    break;

  case 'POST':
    $dados = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('INSERT INTO professores (nome, cpf, data_nascimento, email, telefone, endereco) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([
      $dados['nome'] ?? '',
      $dados['cpf'] ?? '',
      $dados['data_nascimento'] ?? null,
      $dados['email'] ?? '',
      $dados['telefone'] ?? '',
      $dados['endereco'] ?? ''
    ]);
    echo json_encode(['mensagem' => 'Professor cadastrado']);
    break;

  case 'PUT':
    $dados = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('UPDATE professores SET nome=?, cpf=?, data_nascimento=?, email=?, telefone=?, endereco=? WHERE id_SIAPE=?');
    $stmt->execute([
      $dados['nome'] ?? '',
      $dados['cpf'] ?? '',
      $dados['data_nascimento'] ?? null,
      $dados['email'] ?? '',
      $dados['telefone'] ?? '',
      $dados['endereco'] ?? '',
      $dados['id_SIAPE']
    ]);
    echo json_encode(['mensagem' => 'Professor atualizado']);
    break;

  case 'DELETE':
    parse_str(file_get_contents('php://input'), $dados);
    $stmt = $pdo->prepare('DELETE FROM professores WHERE id_SIAPE=?');
    $stmt->execute([$dados['id_SIAPE']]);
    echo json_encode(['mensagem' => 'Professor excluído']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
}