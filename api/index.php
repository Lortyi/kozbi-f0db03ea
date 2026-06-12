<?php
// AKB Szavazó - egyszerű REST API (PHP + MySQL)
// Apache + PHP környezetben fut. Minden kérést ez a fájl kezel.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'config.php hiányzik. Másold át a config.example.php-t config.php néven.']);
    exit;
}
$cfg = require $configFile;

try {
    $pdo = new PDO(
        "mysql:host={$cfg['host']};dbname={$cfg['dbname']};charset={$cfg['charset']}",
        $cfg['user'],
        $cfg['pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error'  => 'Adatbázis kapcsolat sikertelen',
        'detail' => $e->getMessage(),
    ]);
    exit;
}

function body() {
    return json_decode(file_get_contents('php://input'), true) ?: [];
}

function decodeOptions($raw) {
    $v = $raw;
    // Akár duplán kódolt JSON-t is feloldunk.
    for ($i = 0; $i < 3 && is_string($v); $i++) {
        $d = json_decode($v, true);
        if ($d === null) break;
        $v = $d;
    }
    if (is_array($v)) return array_values(array_map('strval', $v));
    return [];
}

function rowToPoll($r) {
    return [
        'id'          => $r['id'],
        'question'    => $r['question'],
        'options'     => decodeOptions($r['options']),
        'status'      => $r['status'],
        'votes'       => json_decode($r['votes'], true) ?: (object)[],
        'deviceVotes' => json_decode($r['device_votes'], true) ?: [],
        'createdAt'   => (int)$r['created_at'],
    ];
}

function listPolls($pdo) {
    $rows = $pdo->query('SELECT * FROM polls ORDER BY created_at DESC')->fetchAll();
    return array_map('rowToPoll', $rows);
}

$action = $_GET['action'] ?? 'list';

try {
    switch ($action) {
        case 'list':
            echo json_encode(listPolls($pdo));
            break;

        case 'create': {
            $b = body();
            $id = 'poll_' . time() . '_' . substr(bin2hex(random_bytes(4)), 0, 7);
            $stmt = $pdo->prepare('INSERT INTO polls (id, question, options, status, votes, device_votes, created_at) VALUES (?,?,?,?,?,?,?)');
            $stmt->execute([
                $id,
                $b['question'] ?? '',
                json_encode(array_values($b['options'] ?? [])),
                'active',
                json_encode((object)[]),
                json_encode([]),
                (int)(microtime(true) * 1000),
            ]);
            echo json_encode(listPolls($pdo));
            break;
        }

        case 'status': {
            $b = body();
            $stmt = $pdo->prepare('UPDATE polls SET status = ? WHERE id = ?');
            $stmt->execute([$b['status'] === 'closed' ? 'closed' : 'active', $b['id'] ?? '']);
            echo json_encode(listPolls($pdo));
            break;
        }

        case 'delete': {
            $b = body();
            $stmt = $pdo->prepare('DELETE FROM polls WHERE id = ?');
            $stmt->execute([$b['id'] ?? '']);
            echo json_encode(listPolls($pdo));
            break;
        }

        case 'vote': {
            $b = body();
            $pollId   = $b['pollId'] ?? '';
            $optIndex = (string)($b['optionIndex'] ?? '');
            $deviceId = $b['deviceId'] ?? '';

            $pdo->beginTransaction();
            $stmt = $pdo->prepare('SELECT * FROM polls WHERE id = ? FOR UPDATE');
            $stmt->execute([$pollId]);
            $row = $stmt->fetch();

            if (!$row) { $pdo->rollBack(); echo json_encode(['result' => 'not_found']); break; }
            if ($row['status'] === 'closed') { $pdo->rollBack(); echo json_encode(['result' => 'closed']); break; }

            $votes  = json_decode($row['votes'], true) ?: [];
            $devs   = json_decode($row['device_votes'], true) ?: [];
            if (in_array($deviceId, $devs, true)) { $pdo->rollBack(); echo json_encode(['result' => 'already_voted']); break; }

            $votes[$optIndex] = ($votes[$optIndex] ?? 0) + 1;
            $devs[] = $deviceId;

            $upd = $pdo->prepare('UPDATE polls SET votes = ?, device_votes = ? WHERE id = ?');
            $upd->execute([json_encode($votes), json_encode($devs), $pollId]);
            $pdo->commit();
            echo json_encode(['result' => 'success', 'polls' => listPolls($pdo)]);
            break;
        }

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Ismeretlen művelet']);
    }
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Szerver hiba']);
}
