<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use Illuminate\Http\Request;

class AlunoController extends Controller
{
    public function index()
    {
        $alunos = Aluno::all();
        return response()->json($alunos);
    }

    public function store(Request $request)
    {
        $dadosValidados = $request->validate([
            'nome_completo' => 'required|string|max:255',
            'data_nascimento' => 'required|date',
            'email' => 'required|email|unique:alunos,email',
            'matricula' => 'required|string|unique:alunos,matricula',
        ]);

        $aluno = Aluno::create($dadosValidados);
        return response()->json($aluno, 201);
    }

    public function show(Aluno $aluno)
    {
        return response()->json($aluno);
    }

    public function update(Request $request, Aluno $aluno)
    {
        $dadosValidados = $request->validate([
            'nome_completo' => 'sometimes|required|string|max:255',
            'data_nascimento' => 'sometimes|required|date',
            'email' => 'sometimes|required|email|unique:alunos,email,' . $aluno->id,
        ]);

        $aluno->update($dadosValidados);
        return response()->json($aluno);
    }

    public function destroy(Aluno $aluno)
    {
        $aluno->delete();
        return response()->json(null, 204);
    }
}