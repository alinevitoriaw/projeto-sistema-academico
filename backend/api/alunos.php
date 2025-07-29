<?php
$arquivo = '../dados/alunos.json';
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
  case 'GET':
    echo file_get_contents($arquivo);
    break;

  case 'POST':
    $dados = json_decode(file_get_contents('php://input'), true);
    $alunos = json_decode(file_get_contents($arquivo), true);
    $dados['id'] = count($alunos) + 1;
    $alunos[] = $dados;
    file_put_contents($arquivo, json_encode($alunos, JSON_PRETTY_PRINT));
    echo json_encode(['mensagem' => 'Aluno cadastrado com sucesso']);
    break;

  case 'PUT':
    $dados = json_decode(file_get_contents('php://input'), true);
    $alunos = json_decode(file_get_contents($arquivo), true);
    foreach ($alunos as &$aluno) {
      if ($aluno['id'] == $dados['id']) {
        $aluno = $dados;
        break;
      }
    }
    file_put_contents($arquivo, json_encode($alunos, JSON_PRETTY_PRINT));
    echo json_encode(['mensagem' => 'Aluno atualizado']);
    break;

  case 'DELETE':
    parse_str(file_get_contents('php://input'), $dados);
    $alunos = json_decode(file_get_contents($arquivo), true);
    $alunos = array_filter($alunos, fn($a) => $a['id'] != $dados['id']);
    file_put_contents($arquivo, json_encode(array_values($alunos), JSON_PRETTY_PRINT));
    echo json_encode(['mensagem' => 'Aluno excluído']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
}   