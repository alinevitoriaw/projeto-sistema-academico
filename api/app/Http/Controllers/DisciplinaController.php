<?php

namespace App\Http\Controllers;

use App\Models\Disciplina;
use Illuminate\Http\Request;

class DisciplinaController extends Controller
{
    public function index()
    {
        $disciplinas = Disciplina::all();
        return response()->json($disciplinas);
    }

    public function store(Request $request)
    {
        $dadosValidados = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'carga_horaria' => 'required|integer|min:1',
        ]);

        $disciplina = Disciplina::create($dadosValidados);
        return response()->json($disciplina, 201);
    }

    public function show(Disciplina $disciplina)
    {
        return response()->json($disciplina);
    }

    public function update(Request $request, Disciplina $disciplina)
    {
        $dadosValidados = $request->validate([
            'nome' => 'sometimes|required|string|max:255',
            'descricao' => 'nullable|string',
            'carga_horaria' => 'sometimes|required|integer|min:1',
        ]);

        $disciplina->update($dadosValidados);
        return response()->json($disciplina);
    }

    public function destroy(Disciplina $disciplina)
    {
        $disciplina->delete();
        return response()->json(null, 204);
    }
}