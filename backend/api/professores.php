<?php
$arquivo = '../dados/professores.json';
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
  case 'GET':
    echo file_get_contents($arquivo);
    break;

  case 'POST':
    $dados = json_decode(file_get_contents('php://input'), true);
    $professores = json_decode(file_get_contents($arquivo), true);
    $dados['id'] = count($professores) + 1;
    $professores[] = $dados;
    file_put_contents($arquivo, json_encode($professores, JSON_PRETTY_PRINT));
    echo json_encode(['mensagem' => 'Professor cadastrado']);
    break;

  case 'PUT':
    $dados = json_decode(file_get_contents('php://input'), true);
    $professores = json_decode(file_get_contents($arquivo), true);
    foreach ($professores as &$prof) {
      if ($prof['id'] == $dados['id']) {
        $prof = $dados;
        break;
      }
    }
    file_put_contents($arquivo, json_encode($professores, JSON_PRETTY_PRINT));
    echo json_encode(['mensagem' => 'Professor atualizado']);
    break;

  case 'DELETE':
    parse_str(file_get_contents('php://input'), $dados);
    $professores = json_decode(file_get_contents($arquivo), true);
    $professores = array_filter($professores, fn($p) => $p['id'] != $dados['id']);
    file_put_contents($arquivo, json_encode(array_values($professores), JSON_PRETTY_PRINT));
    echo json_encode(['mensagem' => 'Professor excluído']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
}