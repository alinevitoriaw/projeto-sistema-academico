<?php

namespace App\Http\Controllers;

use App\Models\Turma;
use Illuminate\Http\Request;

class TurmaController extends Controller
{
    public function index()
    {
        $turmas = Turma::all();
        return response()->json($turmas);
    }

    public function store(Request $request)
    {
        $dadosValidados = $request->validate([
            'codigo_turma' => 'required|string|unique:turmas,codigo_turma',
            'semestre' => 'required|string',
            'ano' => 'required|digits:4',
        ]);

        $turma = Turma::create($dadosValidados);
        return response()->json($turma, 201);
    }

    public function show(Turma $turma)
    {
        return response()->json($turma);
    }

    public function update(Request $request, Turma $turma)
    {
        $dadosValidados = $request->validate([
            'codigo_turma' => 'sometimes|required|string|unique:turmas,codigo_turma,' . $turma->id,
            'semestre' => 'sometimes|required|string',
            'ano' => 'sometimes|required|digits:4',
        ]);

        $turma->update($dadosValidados);
        return response()->json($turma);
    }

    public function destroy(Turma $turma)
    {
        $turma->delete();
        return response()->json(null, 204);
    }
}