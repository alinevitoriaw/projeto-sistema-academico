<?php

namespace App\Http\Controllers;

use App\Models\Professor;
use Illuminate\Http\Request;

class ProfessorController extends Controller
{
    public function index()
    {
        $professores = Professor::all();
        return response()->json($professores);
    }

    public function store(Request $request)
    {
        $dadosValidados = $request->validate([
            'nome_completo' => 'required|string|max:255',
            'email' => 'required|email|unique:professores,email',
            'area_especializacao' => 'required|string',
        ]);

        $professor = Professor::create($dadosValidados);
        return response()->json($professor, 201);
    }

    public function show(Professor $professor)
    {
        return response()->json($professor);
    }

    public function update(Request $request, Professor $professor)
    {
        $dadosValidados = $request->validate([
            'nome_completo' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:professores,email,' . $professor->id,
            'area_especializacao' => 'sometimes|required|string',
        ]);

        $professor->update($dadosValidados);
        return response()->json($professor);
    }

    public function destroy(Professor $professor)
    {
        $professor->delete();
        return response()->json(null, 204);
    }
}