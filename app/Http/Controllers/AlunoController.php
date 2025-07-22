<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AlunoController extends Controller
{
    private $alunos = [
        ['id' => 1, 'nome' => 'Maria Silva', 'email' => 'maria@email.com', 'matricula' => '2023001'],
        ['id' => 2, 'nome' => 'João Souza', 'email' => 'joao@email.com', 'matricula' => '2023002'],
        ['id' => 3, 'nome' => 'Ana Lima', 'email' => 'ana@email.com', 'matricula' => '2023003'],
    ];

    public function index()
    {
        return response()->json($this->alunos);
    }

    public function show($id)
    {
        foreach ($this->alunos as $aluno) {
            if ($aluno['id'] == $id) {
                return response()->json($aluno);
            }
        }

        return response()->json(['erro' => 'Aluno não encontrado'], 404);
    }
}
