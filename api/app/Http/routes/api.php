<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AlunoController;
use App\Http\Controllers\ProfessorController;
use App\Http\Controllers\DisciplinaController;
use App\Http\Controllers\TurmaController;

Route::apiResource('alunos', AlunoController::class);
Route::apiResource('professores', ProfessorController::class);
Route::apiResource('disciplinas', DisciplinaController::class);
Route::apiResource('turmas', TurmaController::class);