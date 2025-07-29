<?php
$db_type = 'mysql';
$db_host = 'localhost';
$db_name = 'sistema_academico';
$db_user = 'root';
$db_pass = 'julia180204.';

try {
    $dsn = "$db_type:host=$db_host;dbname=$db_name;charset=utf8";
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    die(json_encode(['erro' => $e->getMessage()]));
}

