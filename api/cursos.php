<?php
$arquivo = '../dados/cursos.json';
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
  case 'GET':
    echo file_get_contents($arquivo);
    break;

  case 'POST':
    $dados = json_decode(file_get_contents('php://input'), true);
    $cursos = json_decode(file_get_contents($arquivo), true);
    $dados['id'] = count($cursos) + 1;
    $cursos[] = $dados;
    file_put_contents($arquivo, json_encode($cursos, JSON_PRETTY_PRINT));
    echo json_encode(['mensagem' => 'Curso cadastrado']);
    break;

  case 'PUT':
    $dados = json_decode(file_get_contents('php://input'), true);
    $cursos = json_decode(file_get_contents($arquivo), true);
    foreach ($cursos as &$curso) {
      if ($curso['id'] == $dados['id']) {
        $curso = $dados;
        break;
      }
    }
    file_put_contents($arquivo, json_encode($cursos, JSON_PRETTY_PRINT));
    echo json_encode(['mensagem' => 'Curso atualizado']);
    break;

  case 'DELETE':
    parse_str(file_get_contents('php://input'), $dados);
    $cursos = json_decode(file_get_contents($arquivo), true);
    $cursos = array_filter($cursos, fn($c) => $c['id'] != $dados['id']);
    file_put_contents($arquivo, json_encode(array_values($cursos), JSON_PRETTY_PRINT));
    echo json_encode(['mensagem' => 'Curso excluído']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
}