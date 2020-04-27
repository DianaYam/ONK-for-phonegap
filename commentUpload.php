<?php
	require_once 'docAPIBaseInfo.php';
	$con = new PDO('mysql:host=' . ONKDB_HOST, ONKDB_USER, ONKDB_PASS, array(PDO::ATTR_PERSISTENT => true,PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
	$con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$con->exec("USE " . ONKDB_NAME);

	$user_id = $_GET['user_id'];
	$complaint_id = $_GET['complaint_id'];
	$text = $_GET['text'];
	$date = $_GET['date'];

	$query = "insert into comments(USER_ID, COMPLAINT_ID, TEXT, DATE) values ('$user_id', '$complaint_id', '$text', '$date')";
	$con->query($query);
?>