<?php
	if (isset($_POST['avatar_file_upload'])){
		$id = (string)$_POST['avatar_file_upload'];
		$path = './avatars/' . $id;
		unlink($path . '.png');
		unlink($path . '.jpg');
	}
?>