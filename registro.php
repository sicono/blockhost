<?php
header('Content-Type: application/json');

// Datos de conexión (ajusta según tu servidor)
$host = "localhost";
$user = "TU_USUARIO_MYSQL";
$pass = "TU_PASSWORD_MYSQL";
$db   = "panel_1";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Error de conexión con la base de datos"]);
    exit;
}

// Obtener datos del JSON recibido
$data = json_decode(file_get_contents("php://input"), true);
$first = $conn->real_escape_string($data['first_name']);
$last = $conn->real_escape_string($data['last_name']);
$email = $conn->real_escape_string($data['email']);
$password = $data['password'];

// Verificar si el usuario ya existe
$check = $conn->query("SELECT id FROM users WHERE email = '$email' OR username = '$email'");
if ($check->num_rows > 0) {
    echo json_encode(["status" => "exists"]);
    exit;
}

// Encriptar contraseña al estilo Laravel (usado por Pterodactyl)
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// Insertar usuario
$stmt = $conn->prepare("INSERT INTO users (uuid, username, email, password, name_first, name_last, root_admin, language) VALUES (?, ?, ?, ?, ?, ?, 0, 'es')");
$uuid = uniqid('usr_', true);
$stmt->bind_param("ssssss", $uuid, $email, $email, $hashedPassword, $first, $last);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}

$stmt->close();
$conn->close();
?>
