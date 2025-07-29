<?php
require_once '../conexao.php';
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
  case 'GET':
    $stmt = $pdo->query('SELECT * FROM alunos');
    $alunos = $stmt->fetchAll();
    echo json_encode($alunos);
    break;

  case 'POST':
    $dados = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('INSERT INTO alunos (matricula, nome, cpf, data_nascimento, email, telefone, turma) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $dados['matricula'] ?? null,
        $dados['nome'] ?? '',
        $dados['cpf'] ?? '',
        $dados['data_nascimento'] ?? null,
        $dados['email'] ?? '',
        $dados['telefone'] ?? ''
    ]);
    echo json_encode(['mensagem' => 'Aluno cadastrado com sucesso']);
    break;

  case 'PUT':
    $dados = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('UPDATE alunos SET nome=?, cpf=?, data_nascimento=?, email=?, telefone=?, turma=? WHERE matricula=?');
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
    parse_str(file_get_contents('php://input'), $dados);
    $stmt = $pdo->prepare('DELETE FROM alunos WHERE matricula=?');
    $stmt->execute([$dados['matricula']]);
    echo json_encode(['mensagem' => 'Aluno excluído']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
}