<?php
$arquivo = '../dados/turmas.json';
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
  case 'GET':
    echo file_get_contents($arquivo);
    break;

  case 'POST':
    $dados = json_decode(file_get_contents('php://input'), true);
    $turmas = json_decode(file_get_contents($arquivo), true);
    $dados['id'] = count($turmas) + 1;
    $turmas[] = $dados;
    file_put_contents($arquivo, json_encode($turmas, JSON_PRETTY_PRINT));
    echo json_encode(['mensagem' => 'Turma cadastrada']);
    break;

  case 'PUT':
    $dados = json_decode(file_get_contents('php://input'), true);
    $turmas = json_decode(file_get_contents($arquivo), true);
    foreach ($turmas as &$turma) {
      if ($turma['id'] == $dados['id']) {
        $turma = $dados;
        break;
      }
    }
    file_put_contents($arquivo, json_encode($turmas, JSON_PRETTY_PRINT));
    echo json_encode(['mensagem' => 'Turma atualizada']);
    break;

  case 'DELETE':
    parse_str(file_get_contents('php://input'), $dados);
    $turmas = json_decode(file_get_contents($arquivo), true);
    $turmas = array_filter($turmas, fn($t) => $t['id'] != $dados['id']);
    file_put_contents($arquivo, json_encode(array_values($turmas), JSON_PRETTY_PRINT));
    echo json_encode(['mensagem' => 'Turma excluída']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
}
