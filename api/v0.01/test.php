<?php
require_once 'docAPIBaseInfo.php';
$con = new PDO('mysql:host=' . ONKDB_HOST, ONKDB_USER, ONKDB_PASS,
                        array(PDO::ATTR_PERSISTENT => true,PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
$con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$con->exec("USE " . ONKDB_NAME);
$username = $_GET['username'];
$password = $_GET['password'];
// $query = 'select * from ' . ONKDB_PREFIX . 'users WHERE STATUS=0 EMAIL=' . $username . 'limit 1';
$query = 'select * from ' . ONKDB_PREFIX . 'users where STATUS=0 and EMAIL=\'' . $username . '\' and PASSWORD=\'' . $password . '\' limit 1';
$rows = $con->query($query);
if (!$rows) return 'Error';

$found = false;
while ($row = $rows->fetch(PDO::FETCH_OBJ)) {
	$found = true;

	break;
}

if (!$found || !$row) {
	$res = "Error 2";
} else {
	$res = new stdClass();
	$res->id = $row->ID;
}

echo json_encode($res);
?>