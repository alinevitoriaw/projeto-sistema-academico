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
        $stmt = $pdo->query('SELECT * FROM disciplina');
        $disciplinas = $stmt->fetchAll();
        echo json_encode($disciplinas);
        break;

    case 'POST':
        $dados = json_decode(file_get_contents('php://input'), true);
    
        if (!empty($dados['id_disciplina'])) {
            // Upsert (atualização forçada)
            $stmt = $pdo->prepare('INSERT INTO disciplina (nome, descricao, carga_horaria, id_curso)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    nome=VALUES(nome),
                    descricao=VALUES(descricao),
                    carga_horaria=VALUES(carga_horaria),
                    id_curso=VALUES(id_curso)');
            $stmt->execute([
                $dados['nome'] ?? '',
                $dados['descricao'] ?? '',
                $dados['carga_horaria'] ?? null,
                $dados['id_curso'] ?? null
            ]);
            echo json_encode(['mensagem' => 'Disciplina atualizada', 'id_disciplina' => $dados['id_disciplina']]);
        } else {
            // Cadastro novo (sem id_disciplina)
            $stmt = $pdo->prepare('INSERT INTO disciplina (nome, descricao, carga_horaria, id_curso) VALUES (?, ?, ?, ?)');
            $stmt->execute([
                $dados['nome'] ?? '',
                $dados['descricao'] ?? '',
                $dados['carga_horaria'] ?? null,
                $dados['id_curso'] ?? null
            ]);
            $novo_id = $pdo->lastInsertId();
            echo json_encode(['mensagem' => 'Disciplina cadastrada', 'id_disciplina' => $novo_id]);
        }
        break;

    case 'PUT':
        $dados = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('UPDATE disciplina SET nome=?, descricao=?, carga_horaria=?, id_curso=? WHERE id_disciplina=?');
        $stmt->execute([
            $dados['nome'] ?? '',
            $dados['descricao'] ?? '',
            $dados['carga_horaria'] ?? null,
            $dados['id_curso'] ?? null,
            $dados['id_disciplina']
        ]);
        echo json_encode(['mensagem' => 'Disciplina atualizada']);
        break;

    case 'DELETE':
        $dados = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('DELETE FROM disciplina WHERE id_disciplina=?');
        $stmt->execute([$dados['id_disciplina'] ?? null]);
        echo json_encode(['mensagem' => 'Disciplina excluída']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['mensagem' => 'Método não permitido']);
        break;
}
